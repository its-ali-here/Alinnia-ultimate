// app/api/analytics/query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

// This is our original helper function for aggregating chart data. It's still needed.
const processChartData = (data: any[], categoryKey: string, valueKey: string) => {
  if (!data || data.length === 0) return [];

  const result = data.reduce((acc, row) => {
      const category = row[categoryKey];
      const value = parseFloat(row[valueKey]) || 0;

      if (category) {
          if (!acc[category]) {
              acc[category] = 0;
          }
          acc[category] += value;
      }
      return acc;
  }, {} as Record<string, number>);

  return Object.entries(result).map(([key, sum]) => ({
      [categoryKey]: key,
      [valueKey]: sum,
  }));
};

// This is a new helper for map data. It doesn't aggregate, it just returns the rows.
const processMapData = (data: any[], query: any) => {
    if (!data || data.length === 0) return [];
    
    // For map data, we don't need to process or group it.
    // The GeoWidget on the frontend will handle everything.
    // We just return the raw data rows that were fetched.
    return data;
};


export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();

    try {
        // We now read the full body of the request
        const body = await req.json();
        const { datasourceId, query, chartType, categoryKey, valueKey } = body;

        if (!datasourceId) {
            return NextResponse.json({ error: 'Missing datasourceId parameter.' }, { status: 400 });
        }

        const { data: datasource, error: fetchError } = await supabaseAdmin
            .from('datasources')
            .select('processed_data')
            .eq('id', datasourceId)
            .single();

        if (fetchError || !datasource || !datasource.processed_data) {
            throw new Error(`Could not find processed data for datasource: ${datasourceId}`);
        }

        let responseData;

        // --- NEW LOGIC ---
        // We check if this is a map request or a standard chart request.
        if (chartType === 'map' && query && query.dimensions) {
            // It's a map request. Use the new map data processor.
            responseData = processMapData(datasource.processed_data, query);
        } else if (categoryKey && valueKey) {
            // It's a legacy chart request. Use the original chart processor.
            responseData = processChartData(datasource.processed_data, categoryKey, valueKey);
        } else {
            // If the request doesn't match either format, it's a bad request.
            return NextResponse.json({ error: 'Request is missing required parameters for chart or map.' }, { status: 400 });
        }

        return NextResponse.json({ data: responseData });

    } catch (error) {
        console.error("API Query Error:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}