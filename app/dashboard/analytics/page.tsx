// app/dashboard/analytics/page.tsx

"use client"; // <-- Step 1: Mark this as a Client Component to allow state and effects.

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/analytics/overview-tab";
import { ReportsTab } from "@/components/analytics/reports-tab";
import { NotificationsTab } from "@/components/analytics/notifications-tab";
import { Skeleton } from "@/components/ui/skeleton";

// Step 2: Import our new ChartWidget
import { ChartWidget } from "@/components/analytics/chart-widget";

export default function AnalyticsPage() {
  // Step 3: Create state to hold the data for our new chart
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Step 4: Use useEffect to fetch data from our API when the page loads
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Later, these values will come from UI controls (dropdowns, etc.)
            chartType: 'bar',
            datasourceId: 'some-id-from-a-dropdown',
            // IMPORTANT: These keys match the dummy data in our API route
            categoryKey: 'Laptops', // Using the key from your dummy data
            valueKey: 'sales',      // Using the key from your dummy data
          }),
        });
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // The empty array [] means this effect runs only once when the page loads.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your financial data and business metrics.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Step 5: Replace the old AnalyticsTab with our new ChartWidget */}
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartWidget
              title="Sales by Product (from API)"
              chartType="bar"
              data={chartData}
              categoryKey="Laptops" // Tell the widget which data key to use for the X-axis
              valueKey="sales"   // and which to use for the Y-axis
            />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}