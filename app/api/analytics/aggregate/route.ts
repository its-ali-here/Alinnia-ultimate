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

const performAggregation = (data: any[], columnName: string, aggregationType: 'sum' | 'average' | 'count' | 'median' | 'min' | 'max') => {
    if (!data || data.length === 0) return 0;
    const validNumbers = data.map(row => parseFloat(row[columnName])).filter(n => !isNaN(n));
    if (validNumbers.length === 0 && aggregationType !== 'count') return 0;
    switch (aggregationType) {
        case 'sum': return validNumbers.reduce((acc, val) => acc + val, 0);
        case 'count': return data.length;
        case 'average': const sum = validNumbers.reduce((acc, val) => acc + val, 0); return sum / validNumbers.length;
        case 'median': const sorted = validNumbers.sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        case 'min': return Math.min(...validNumbers);
        case 'max': return Math.max(...validNumbers);
        default: return 0;
    }
};

export async function POST(req: Request) {
    try {
        const { datasourceId, columnName, aggregationType, filters } = await req.json();
        if (!datasourceId || !columnName || !aggregationType) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseAdminClient();
        const { data: datasource, error } = await supabaseAdmin.from('datasources').select('processed_data, date_format').eq('id', datasourceId).single();
        if (error || !datasource?.processed_data) {
            throw new Error(`Could not find data for datasource: ${datasourceId}`);
        }

        const dateFormat = datasource.date_format || 'yyyy-MM-dd'; // Default format if none is saved
        const filteredData = applyFilters(datasource.processed_data, filters, dateFormat);
        const result = performAggregation(filteredData, columnName, aggregationType);

        return NextResponse.json({ result });

    } catch (error) {
        console.error("API Aggregate Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}