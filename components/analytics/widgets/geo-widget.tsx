'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapDisplay } from './map-display';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // We will now structure the query like a standard chart aggregation
      // to ensure the API can process it correctly.
      const query = {
        dimensions: [
            widgetConfig.query.latKey, 
            widgetConfig.query.lonKey, 
            // We also group by the value key to get it back for our popups
            widgetConfig.query.valueKey 
        ],
        // We add a simple aggregation metric. The API requires at least one.
        metrics: [{
            aggregation: 'count', // 'count' is a safe default
            column: widgetConfig.query.valueKey 
        }]
      };

      try {
        // Fetch from the standard API route
        const response = await fetch('/api/analytics/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                datasourceId,
                query,
                filters,
                // We add the chartType hint, as the backend may use it for routing
                chartType: 'map' 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
  }, [widgetConfig, datasourceId, filters]); // Re-fetch if config or filters change

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

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
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