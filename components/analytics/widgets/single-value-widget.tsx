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
    if (value === null) return 'N/A';
    
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

export function SingleValueWidget({ widgetConfig, datasourceId }: SingleValueWidgetProps) {
    const [value, setValue] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // This fetching logic is correct and remains the same
                const response = await fetch('/api/analytics/filtered-query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId,
                        ...widgetConfig.query,
                        filters: {},
                    }),
                });
                if (!response.ok) throw new Error('Failed to fetch aggregate data.');
                const data = await response.json();
                setValue(data.result);
            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
                setValue(null); // Set value to null on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId]);

    if (isLoading) {
        // The skeleton is now simpler because it doesn't need the card structure
        return (
            <div className="h-full w-full flex flex-col justify-center gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
    }

    // --- THIS IS THE REFACTORED RETURN STATEMENT ---
    // It no longer contains Card elements. It just returns the core content.
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