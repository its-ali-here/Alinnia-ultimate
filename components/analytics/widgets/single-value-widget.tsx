"use client"

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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

// Helper function to format the number, which remains very useful
const formatValue = (value: number | null, formatType?: 'number' | 'currency' | 'percent') => {
    if (value === null || value === undefined) return 'N/A';
    
    const options: Intl.NumberFormatOptions = {
        maximumFractionDigits: 2,
    };

    switch (formatType) {
        case 'currency':
            options.style = 'currency';
            options.currency = 'USD'; // This can be made dynamic later
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

    useEffect(() => {
        if (dbLoading || !db) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the datasource to get the fileUrl
                const dsResponse = await fetch(`/api/data-sources/${datasourceId}`);
                if (!dsResponse.ok) {
                    throw new Error('Failed to fetch datasource details.');
                }
                const dsData = await dsResponse.json();
                const fileUrl = dsData.data?.file_url;

                if (!fileUrl) {
                    throw new Error('This datasource has no associated file.');
                }
                
                await db.registerFileURL(
                    'my_table.csv',
                    fileUrl,
                    4, // CSV
                    true
                  );

                // 2. Construct the SQL query
                const { columnName, aggregationType } = widgetConfig.query;
                let query = `SELECT ${aggregationType}(${columnName}) as value FROM "my_table.csv"`;

                if (filters?.dateRange?.from && filters?.dateRange?.to && filters?.dateColumn) {
                    const from = format(new Date(filters.dateRange.from), 'yyyy-MM-dd');
                    const to = format(new Date(filters.dateRange.to), 'yyyy-MM-dd');
                    const whereClause = `WHERE CAST("${filters.dateColumn}" AS DATE) BETWEEN '${from}' AND '${to}'`;
                    query = `${query} ${whereClause}`;
                }

                // 3. Call the server-side query endpoint
                const c = await db.connect();
                const result = await c.query(query);
                const resultData = result.toArray().map(Object.fromEntries);
                
                // The result from the new API is an array of objects
                if (resultData && resultData.length > 0) {
                    // The value is the first key of the first object
                    const resultValue = (resultData[0] as any)?.value;
                    setValue(Number(resultValue));
                } else {
                    setValue(null);
                }
                await c.close();
            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
                setValue(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId, filters, db, dbLoading]);

    if (isLoading || dbLoading) {
        return (
            <div className="h-full w-full flex flex-col justify-center gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
    }

    if (dbError) {
        return <div className="text-center text-red-500 text-sm h-full flex items-center justify-center">Error initializing database: {dbError.message}</div>;
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