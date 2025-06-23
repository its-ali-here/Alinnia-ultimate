"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import { ChartWidget } from "@/components/analytics/chart-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// This makes ResponsiveGridLayout work correctly with Next.js
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define the shape of our widget data
interface Widget {
  id: string;
  title: string;
  chartType: 'bar'; // We can add more types like 'line' later
  datasourceId: string;
  query: {
    categoryKey: string;
    valueKey: string;
  };
  layout: { i: string; x: number; y: number; w: number; h: number };
  data: any[];
}

export default function AnalyticsDashboardPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a future step, this `useEffect` would fetch a saved dashboard layout from your database.
  // For now, we'll use a hardcoded layout with ONE widget to test our setup.
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);

      // --- Hardcoded Test Widget ---
      const initialWidget: Omit<Widget, 'data'> = {
        id: 'sales-by-product',
        title: 'Items Sold by Product',
        chartType: 'bar',
        // IMPORTANT: You MUST replace this with a real ID from your `datasources` table
        datasourceId: 'e520426b-7be1-4967-8b3e-6aa2e8cce8c9', 
        query: {
          categoryKey: 'Product',      // Make sure this column exists in your CSV
          valueKey: 'Units Sold',      // Make sure this column exists in your CSV
        },
        // Grid layout: x-position, y-position, width, height
        layout: { i: 'sales-by-product', x: 0, y: 0, w: 6, h: 2 },
      };
      // ---

      // Check if a datasourceId has been provided
      if (initialWidget.datasourceId === 'YOUR_DATASOURCE_ID_HERE') {
        toast.error("Please update the datasourceId in the code to test the chart.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch data specifically for this widget
        const response = await fetch('/api/analytics/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasourceId: initialWidget.datasourceId,
            categoryKey: initialWidget.query.categoryKey,
            valueKey: initialWidget.query.valueKey
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch data for the widget.');

        const data = await response.json();
        const widgetWithData: Widget = { ...initialWidget, data };

        setWidgets([widgetWithData]); // Set the state with our single widget

      } catch (error) {
        toast.error((error as Error).message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const onLayoutChange = (newLayout: any) => {
    console.log("Layout changed:", newLayout);
    // In a future step, we will save this newLayout to our database here.
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Your customizable analytics dashboard. Drag and resize the widgets.</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: widgets.map(w => w.layout) }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={150}
          onLayoutChange={onLayoutChange}
        >
          {widgets.map(widget => (
            <Card key={widget.id}>
              <ChartWidget
                title={widget.title}
                chartType={widget.chartType}
                data={widget.data}
                categoryKey={widget.query.categoryKey}
                valueKey={widget.query.valueKey}
              />
            </Card>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}