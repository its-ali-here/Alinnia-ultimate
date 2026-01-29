// components/analytics/smart-chart-widget.tsx
"use client"

import { useEffect, useState } from "react"
import { useDuckDB } from "@/hooks/use-duckdb"
import { ChartWidget } from "./chart-widget" // Importing your existing component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SmartChartWidgetProps {
  title: string;
  fileUrl: string;    // URL to the CSV file (Supabase or Google Sheets)
  query: string;      // SQL Query to run (e.g. "SELECT City, SUM(Sales) as Total...")
  chartType: 'bar';   // Passed through to the visual widget
  categoryKey: string; // Which column is the X-axis?
  valueKey: string;    // Which column is the Y-axis?
}

export function SmartChartWidget({ 
  title, 
  fileUrl, 
  query, 
  chartType, 
  categoryKey, 
  valueKey 
}: SmartChartWidgetProps) {
  
  const { db, conn, isLoading: isDbLoading } = useDuckDB();
  const [data, setData] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!db || !conn || !fileUrl) return;

      setIsQuerying(true);
      setError(null);

      try {
        // 1. Give the file a temporary name
        const fileName = 'temp_data.csv';

        // 2. Register the file URL with DuckDB
        // This tells DuckDB: "When I ask for 'temp_data.csv', go fetch it from this URL"
        await db.registerFileURL(fileName, fileUrl, 4 /* DuckDBDataProtocol.HTTP */, false);
        
        // 3. Load it into a virtual table
        await conn.insertCSVFromPath(fileName, { 
            name: 'my_table', 
            schema: 'auto', 
            header: true, 
            detect: true 
        });

        // 4. Run the User's SQL Query
        // We replace "FROM table" in their query with our temp table name if needed,
        // or users can simply write "SELECT * FROM my_table"
        const result = await conn.query(query.replace('FROM source', 'FROM my_table'));

        // 5. Convert Arrow result to JSON for Recharts
        setData(result.toArray().map((row) => row.toJSON()));

        // Cleanup: Remove file from memory to save RAM
        await db.registerFileURL(fileName, '', 4, false); 
        await conn.query(`DROP TABLE IF EXISTS my_table`);

      } catch (err) {
        console.error("Query Error:", err);
        setError("Failed to process data.");
      } finally {
        setIsQuerying(false);
      }
    }

    if (!isDbLoading) {
      fetchData();
    }
  }, [db, conn, isDbLoading, fileUrl, query]);

  // Loading State
  if (isDbLoading || isQuerying) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  // Success State - Render your EXISTING component
  return (
    <ChartWidget 
      title={title}
      chartType={chartType}
      data={data}
      categoryKey={categoryKey}
      valueKey={valueKey}
    />
  );
}