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
                
                // 2. Construct the SQL query
                const { columnName, aggregationType } = widgetConfig.query;
                // TODO: Implement filtering in the SQL query
                const query = `SELECT ${aggregationType}(${columnName}) as value FROM my_table`;

                // 3. Call the server-side query endpoint
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileUrl,
                        query,
                        filters, // Passing filters to be handled server-side if needed
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch aggregate data.');
                }
                const result = await response.json();
                
                // The result from the new API is an array of objects
                if (result.data && result.data.length > 0) {
                    // The value is the first key of the first object
                    const resultValue = result.data[0]?.value;
                    setValue(Number(resultValue));
                } else {
                    setValue(null);
                }

            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
                setValue(null);
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