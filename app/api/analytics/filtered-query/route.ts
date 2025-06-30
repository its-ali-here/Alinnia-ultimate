import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { parse, isWithinInterval, isValid } from 'date-fns';

// Helper function to apply all filters
const applyFilters = (data: any[], filters: any) => {
    let filteredData = data;

    // Date Range Filter
    if (filters?.dateRange && filters.dateColumn && filters.dateRange.from && filters.dateRange.to) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        if (isValid(from) && isValid(to)) {
            filteredData = filteredData.filter(row => {
                // Ensure the date column exists in the row before trying to parse
                if (!row[filters.dateColumn]) {
                    return false;
                }
                // Attempt to parse a common date format (YYYY-MM-DD). 
                // You might need to adjust this depending on your CSV's date format.
                const rowDate = parse(row[filters.dateColumn], 'yyyy-MM-dd', new Date());
                return isValid(rowDate) && isWithinInterval(rowDate, { start: from, end: to });
            });
        }
    }
    
    return filteredData;
};

// --- THIS IS THE COMPLETE, CORRECT DATA PROCESSING FUNCTION ---
const processData = (data: any[], categoryKey: string, valueKey: string) => {
    if (!data || data.length === 0 || !categoryKey || !valueKey) {
        return [];
    }

    // This groups data by the category and sums the value
    const result = data.reduce((acc, row) => {
        const category = row[categoryKey];
        const value = parseFloat(row[valueKey]);

        if (category && !isNaN(value)) {
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += value;
        }
        return acc;
    }, {} as Record<string, number>);

    // This converts the aggregated data back into an array for the chart
    return Object.entries(result).map(([key, sum]) => ({
        [categoryKey]: key,
        [valueKey]: sum,
    }));
};

export async function POST(req: Request) {
    try {
        const { datasourceId, query, filters } = await req.json();

        if (!datasourceId || !query) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseAdminClient();
        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource?.processed_data) {
            throw new Error(`Could not find processed data for datasource: ${datasourceId}`);
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