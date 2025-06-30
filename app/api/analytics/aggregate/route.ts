// app/api/analytics/aggregate/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

const performAggregation = (data: any[], columnName: string, aggregationType: 'sum' | 'average' | 'count') => {
    if (!data || data.length === 0) return 0;

    const validNumbers = data.map(row => parseFloat(row[columnName])).filter(n => !isNaN(n));

    if (validNumbers.length === 0) return 0;

    switch (aggregationType) {
        case 'sum':
            return validNumbers.reduce((acc, val) => acc + val, 0);
        case 'count':
            return data.length;
        case 'average':
            const sum = validNumbers.reduce((acc, val) => acc + val, 0);
            return sum / validNumbers.length;
        case 'median':
            const sorted = validNumbers.sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        case 'min':
            return Math.min(...validNumbers);
        case 'max':
            return Math.max(...validNumbers);
        default:
            return 0;
    }
};

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();
    try {
        const { datasourceId, columnName, aggregationType } = await req.json();
        if (!datasourceId || !columnName || !aggregationType) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource) throw new Error(`Could not find data for datasource: ${datasourceId}`);

        const result = performAggregation(datasource.processed_data, columnName, aggregationType);

        return NextResponse.json({ result });

    } catch (error) {
        console.error("API Aggregate Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}