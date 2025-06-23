// app/api/analytics/query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

// This is a helper function to perform a "GROUP BY" and "COUNT" on our JSON data.
// This is where the magic happens! It turns raw rows into aggregated insights.
const processData = (data: any[], categoryKey: string, valueKey: string) => {
    if (!data || data.length === 0) return [];

    const result = data.reduce((acc, row) => {
        const category = row[categoryKey];
        // We check if the row has the category key we're grouping by.
        if (category) {
            if (!acc[category]) {
                acc[category] = 0;
            }
            // For now, we are just counting the number of times each category appears.
            acc[category] += 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // The result is an object like { "Laptops": 114, "Chairs": 119 }.
    // We need to convert it into an array of objects for the recharts library.
    return Object.entries(result).map(([key, count]) => ({
        [categoryKey]: key,
        [valueKey]: count, // We use the valueKey here for consistency with our ChartWidget
    }));
};

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();

    try {
        const { datasourceId, categoryKey, valueKey } = await req.json();

        if (!datasourceId || !categoryKey || !valueKey) {
            return NextResponse.json({ error: 'Missing required query parameters.' }, { status: 400 });
        }

        // 1. Fetch the processed_data from the correct datasource record
        const { data: datasource, error: fetchError } = await supabaseAdmin
            .from('datasources')
            .select('processed_data') // We only need the JSON data column
            .eq('id', datasourceId)
            .single();

        if (fetchError || !datasource || !datasource.processed_data) {
            throw new Error(`Could not find processed data for datasource: ${datasourceId}`);
        }

        // 2. Process the raw JSON data with our helper function
        const aggregatedData = processData(datasource.processed_data, categoryKey, valueKey);

        // 3. Return the final aggregated data, ready for charting!
        return NextResponse.json(aggregatedData);

    } catch (error) {
        console.error("API Query Error:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}