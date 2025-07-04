import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { parse, isWithinInterval, isValid } from 'date-fns';

const applyFilters = (data: any[], filters: any, dateFormat: string) => {
    if (!filters) return data;
    let filteredData = data;

    if (filters.dateRange && filters.dateColumn && filters.dateRange.from && filters.dateRange.to) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        if (isValid(from) && isValid(to)) {
            filteredData = filteredData.filter(row => {
                if (!row[filters.dateColumn]) return false;
                // Use the user-provided date format for accurate parsing
                const rowDate = parse(row[filters.dateColumn], dateFormat, new Date());
                return isValid(rowDate) && isWithinInterval(rowDate, { start: from, end: to });
            });
        }
    }
    return filteredData;
};

const processData = (data: any[], categoryKey: string, valueKey: string) => {
    if (!data || data.length === 0 || !categoryKey || !valueKey) {
        return [];
    }

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

    return Object.entries(result).map(([key, sum]) => ({
        [categoryKey]: key,
        [valueKey]: sum,
    }));
};

export async function POST(req: Request) {
    try {
        const { datasourceId, query, filters } = await req.json();

        // Inject global date range into filters if not already provided
        const globalDateRange = filters?.globalDateRange || { from: null, to: null };
        if (!filters.dateRange) {
            filters.dateRange = globalDateRange;
        }

        if (!datasourceId || !query || !query.categoryKey || !query.valueKey) {
            return NextResponse.json({ error: 'Missing required query parameters.' }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseAdminClient();
        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data, date_format')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource?.processed_data) {
            throw new Error(`Could not find processed data for datasource: ${datasourceId}`);
        }

        const dateFormat = datasource.date_format || 'yyyy-MM-dd'; // Default format if none is saved
        const filteredData = applyFilters(datasource.processed_data, filters, dateFormat);
        const result = processData(filteredData, query.categoryKey, query.valueKey);
        
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Filtered Query Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}