// components/analytics/widgets/single-value-widget.tsx
"use client"

import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDuckDB } from '@/contexts/duckdb-context';
import { format } from 'date-fns';

interface SingleValueWidgetProps {
    widgetConfig: {
        title: string;
        query: {
            columnName: string;
            aggregationType: 'sum' | 'average' | 'count' | 'median' | 'min' | 'max';
            format?: 'number' | 'currency' | 'percent';
        };
    };
    datasourceId: string;
    filters: any;
}

const formatValue = (value: number | null, formatType?: 'number' | 'currency' | 'percent') => {
    if (value === null || value === undefined) return 'N/A';
    
    const options: Intl.NumberFormatOptions = {
        maximumFractionDigits: 2,
    };

    switch (formatType) {
        case 'currency':
            options.style = 'currency';
            options.currency = 'USD';
            break;
        case 'percent':
            options.style = 'percent';
            options.maximumFractionDigits = 1;
            break;
    }

    return new Intl.NumberFormat('en-US', options).format(value);
}

export function SingleValueWidget({ widgetConfig, datasourceId, filters }: SingleValueWidgetProps) {
    const [value, setValue] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { db, loading: dbLoading, error: dbError } = useDuckDB();
    const lastFetchConfig = useRef<string>("");

    useEffect(() => {
        if (dbLoading || !db) return;
        
        const currentConfigString = JSON.stringify({ widgetConfig, datasourceId, filters });
        if (lastFetchConfig.current === currentConfigString && value !== null) return;

        const uniqueFileName = `data_${Math.random().toString(36).substr(2, 9)}.csv`;

        const fetchData = async () => {
            if (value === null) setIsLoading(true);
            try {
                const dsResponse = await fetch(`/api/data-sources/${datasourceId}`);
                if (!dsResponse.ok) throw new Error('Failed to fetch datasource details.');
                
                const dsData = await dsResponse.json();
                const fileUrl = dsData.data?.file_url;
                if (!fileUrl) throw new Error('This datasource has no associated file.');
                
                await db.registerFileURL(uniqueFileName, fileUrl, 4, true);

                const { columnName, aggregationType } = widgetConfig.query;
                
                // --- THE FIX IS HERE ---
                // 1. REPLACE(..., ',', '') removes commas (1,000 -> 1000)
                // 2. REPLACE(..., '$', '') removes currency signs ($50 -> 50)
                // 3. TRY_CAST(... AS DOUBLE) safely converts to number (ignoring bad text)
                const safeColumn = `TRY_CAST(NULLIF(REPLACE(REPLACE(CAST("${columnName}" AS VARCHAR), ',', ''), '$', ''), '') AS DOUBLE)`;
                
                let query = '';
                if (aggregationType === 'count') {
                    // Count doesn't need casting
                    query = `SELECT COUNT(*) as value FROM "${uniqueFileName}"`;
                } else {
                    query = `SELECT ${aggregationType}(${safeColumn}) as value FROM "${uniqueFileName}"`;
                }

                if (filters?.dateRange?.from && filters?.dateRange?.to && filters?.dateColumn) {
                    const from = format(new Date(filters.dateRange.from), 'yyyy-MM-dd');
                    const to = format(new Date(filters.dateRange.to), 'yyyy-MM-dd');
                    const whereClause = `WHERE CAST("${filters.dateColumn}" AS DATE) BETWEEN '${from}' AND '${to}'`;
                    query = `${query} ${whereClause}`;
                }

                const c = await db.connect();
                const result = await c.query(query);
                const resultData = result.toArray().map(Object.fromEntries);
                
                if (resultData && resultData.length > 0) {
                    const resultValue = (resultData[0] as any)?.value;
                    setValue(Number(resultValue));
                } else {
                    setValue(null);
                }
                
                lastFetchConfig.current = currentConfigString;
                await c.close();

            } catch (error) {
                console.error("Widget Error:", error);
            } finally {
                try { await db.registerFileURL(uniqueFileName, '', 4, true); } catch (e) { }
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId, filters, db, dbLoading, value]);

    if (isLoading && value === null) {
        return (
            <div className="h-full w-full flex flex-col justify-center gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
    }

    if (dbError) {
        return <div className="text-red-500 text-xs">DB Error</div>;
    }

    return (
        <div className="flex flex-col justify-center h-full">
            <div className="text-4xl font-bold">
                {formatValue(value, widgetConfig.query.format)}
            </div>
            <p className="text-xs text-muted-foreground capitalize truncate">
               {widgetConfig.query.aggregationType} of {widgetConfig.query.columnName}
            </p>
        </div>
    );
}