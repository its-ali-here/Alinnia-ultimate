'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapDisplay } from './map-display';
import { Loader2 } from 'lucide-react';
import { useDuckDB } from '@/contexts/duckdb-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Define the structure for the props this component will receive
interface GeoWidgetProps {
  widgetConfig: any;
  datasourceId: string;
  filters: any;
}

// Define the structure of the raw data we expect from the server
interface RawDataPoint {
  [key: string]: any;
}

export const GeoWidget = ({ widgetConfig, datasourceId, filters }: GeoWidgetProps) => {
  const [data, setData] = useState<RawDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { db, loading: dbLoading, error: dbError } = useDuckDB();

  useEffect(() => {
    if (dbLoading || !db) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
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

        // Register the file as a table
        await db.registerFileURL(
            'my_table.csv',
            fileUrl,
            4, // CSV
            true
          );

        // 2. Construct the SQL query
        const { latKey, lonKey, valueKey } = widgetConfig.query;
        let sqlQuery = `SELECT "${latKey}", "${lonKey}", "${valueKey}" FROM "my_table.csv"`;

        if (filters?.dateRange?.from && filters?.dateRange?.to && filters?.dateColumn) {
            const from = format(new Date(filters.dateRange.from), 'yyyy-MM-dd');
            const to = format(new Date(filters.dateRange.to), 'yyyy-MM-dd');
            const whereClause = ` WHERE CAST("${filters.dateColumn}" AS DATE) BETWEEN '${from}' AND '${to}'`;
            sqlQuery = `${sqlQuery}${whereClause}`;
        }
        
        // 3. Run the query
        const c = await db.connect();
        const result = await c.query(sqlQuery);
        setData(JSON.parse(JSON.stringify(result.toArray().map(Object.fromEntries))));
        await c.close();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast.error(`Could not load data for "${widgetConfig.title}": ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (widgetConfig.query.latKey && widgetConfig.query.lonKey && widgetConfig.query.valueKey) {
        fetchData();
    } else {
        setIsLoading(false);
        setError("Widget is not fully configured. Please edit it to select latitude, longitude, and value columns.");
    }
  }, [widgetConfig, datasourceId, filters, db, dbLoading]); // Re-fetch if config or filters change

  // This part processes the data for the MapDisplay component. It remains the same.
  const mapData = useMemo(() => {
    const latKey = widgetConfig.query.latKey;
    const lonKey = widgetConfig.query.lonKey;

    if (!latKey || !lonKey) {
        return [];
    }

    return data.map(point => ({
      ...point, 
      lat: parseFloat(point[latKey]),
      lon: parseFloat(point[lonKey]),
    })).filter(point => !isNaN(point.lat) && !isNaN(point.lon));
  }, [data, widgetConfig]);

  if (isLoading || dbLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (dbError) {
      return <div className="text-center text-red-500 text-sm h-full flex items-center justify-center">Error initializing database: {dbError.message}</div>;
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-red-500 text-sm p-4">
        {error}
      </div>
    );
  }

  return <MapDisplay data={mapData} />;
};