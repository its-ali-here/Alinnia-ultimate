// app/api/analytics/filtered-query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { parse, isWithinInterval } from 'date-fns';

const applyFilters = (data: any[], filters: any) => {
    let filteredData = data;

    // Apply Date Range Filter
    if (filters.dateRange && filters.dateRange.from && filters.dateRange.to && filters.dateColumn) {
        const startDate = new Date(filters.dateRange.from);
        const endDate = new Date(filters.dateRange.to);

        filteredData = filteredData.filter(row => {
            const rowDate = parse(row[filters.dateColumn], 'yyyy-MM-dd', new Date());
            return isWithinInterval(rowDate, { start: startDate, end: endDate });
        });
    }

    // Future filters (e.g., by category) can be added here as more 'if' blocks.

    return filteredData;
};

// This is the same aggregation function from your other API route
const processData = (data: any[], categoryKey: string, valueKey: string) => {
  if (!data || data.length === 0) return [];

  const result = data.reduce((acc, row) => {
      const category = row[categoryKey];
      // Convert the value from the CSV (which is a string) to a number.
      // If it's not a valid number, treat it as 0.
      const value = parseFloat(row[valueKey]) || 0;

      if (category) {
          if (!acc[category]) {
              acc[category] = 0;
          }
          // THE FIX: We now SUM the value, instead of just counting (+= 1).
          acc[category] += value;
      }
      return acc;
  }, {} as Record<string, number>);

  // Convert the aggregated object back into an array for the chart
  return Object.entries(result).map(([key, sum]) => ({
      [categoryKey]: key,
      [valueKey]: sum,
  }));
};

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();
    try {
        const { datasourceId, query, filters } = await req.json();

        if (!datasourceId || !query) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource || !datasource.processed_data) {
            throw new Error(`Could not find data for datasource: ${datasourceId}`);
        }

        // Step 1: Apply filters to the raw data
        const filteredData = applyFilters(datasource.processed_data, filters);

        // Step 2: Process the filtered data (e.g., aggregate for charts)
        const result = processData(filteredData, query.categoryKey, query.valueKey);

        return NextResponse.json(result);

    } catch (error) {
        console.error("API Filtered Query Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}