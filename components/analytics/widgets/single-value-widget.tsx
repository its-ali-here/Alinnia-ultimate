"use client"

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // *** THIS IS THE CORRECTED FETCH CALL ***
                const response = await fetch('/api/analytics/aggregate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId,
                        columnName: widgetConfig.query.columnName,
                        aggregationType: widgetConfig.query.aggregationType,
                        filters, // Pass the filters to the aggregate API
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch aggregate data.');
                }
                const data = await response.json();
                console.log(`[Summary Card: ${widgetConfig.title}] Data received from API:`, data);
                setValue(data.result);
            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
                setValue(null); // Set value to null on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId, filters]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex flex-col justify-center gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
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