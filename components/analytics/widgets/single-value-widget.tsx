// components/analytics/widgets/single-value-widget.tsx
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react'; // Example icon

interface SingleValueWidgetProps {
    widgetConfig: {
        title: string;
        query: {
            columnName: string;
            aggregationType: 'sum' | 'average' | 'count';
        };
    };
    datasourceId: string;
}

export function SingleValueWidget({ widgetConfig, datasourceId }: SingleValueWidgetProps) {
    const [value, setValue] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/analytics/aggregate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId,
                        ...widgetConfig.query,
                    }),
                });
                if (!response.ok) throw new Error('Failed to fetch aggregate data.');
                const data = await response.json();
                setValue(data.result);
            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId]);

    if (isLoading) {
        return (
            <Card className="h-full w-full p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-10 w-1/2" />
            </Card>
        )
    }

    const formattedValue = value?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });

    return (
        <Card className="h-full w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{widgetConfig.title}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">
                    {formattedValue}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                   {widgetConfig.query.aggregationType} of {widgetConfig.query.columnName}
                </p>
            </CardContent>
        </Card>
    );
}