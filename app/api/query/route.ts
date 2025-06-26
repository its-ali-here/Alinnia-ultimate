// app/api/analytics/query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

// This is our data processing function. It groups and sums the data.
const processData = (data: any[], categoryKey: string, valueKey: string) => {
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

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();
    try {
        const { datasourceId, categoryKey, valueKey } = await req.json();
        if (!datasourceId || !categoryKey || !valueKey) {
            return NextResponse.json({ error: 'Missing required query parameters.' }, { status: 400 });
        }

        const { data: datasource, error: fetchError } = await supabaseAdmin
            .from('datasources')
            .select('processed_data') // We only need the JSON data column
            .eq('id', datasourceId)
            .single();

        if (fetchError || !datasource || !datasource.processed_data) {
            throw new Error(`Could not find processed data for datasource: ${datasourceId}`);
        }

        const aggregatedData = processData(datasource.processed_data, categoryKey, valueKey);

        return NextResponse.json(aggregatedData);

    } catch (error) {
        console.error("API Query Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}