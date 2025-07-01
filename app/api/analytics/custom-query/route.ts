import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { parse, isWithinInterval, isValid } from 'date-fns';

// This function applies the filters. It's now more robust.
const applyFilters = (data: any[], filters: any[], dateFormat: string) => {
    if (!filters || filters.length === 0) return data;

    return data.filter(row => {
        return filters.every(filter => {
            if (!filter.column || !filter.condition) return true;
            const rowValue = row[filter.column] ?? '';
            const filterValue = filter.value ?? '';

            switch (filter.condition) {
                case 'is': return rowValue.toString() === filterValue;
                case 'is_not': return rowValue.toString() !== filterValue;
                case 'contains': return rowValue.toString().includes(filterValue);
                case 'does_not_contain': return !rowValue.toString().includes(filterValue);
                case 'is_empty': return rowValue === '' || rowValue === null;
                case 'not_empty': return rowValue !== '' && rowValue !== null;
                // Add more conditions for numbers or dates if needed
                default: return true;
            }
        });
    });
};

// This function performs the main query logic: filtering, grouping, and summarizing.
const performQuery = (data: any[], query: any, dateFormat: string) => {
    const { filters, summaries, groupBy } = query;

    // 1. Apply Filters
    let filteredData = applyFilters(data, filters, dateFormat);

    // 2. Group Data
    const groupedData = filteredData.reduce((acc, row) => {
        const key = groupBy ? row[groupBy] : 'Total';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(row);
        return acc;
    }, {} as Record<string, any[]>);

    // 3. Summarize (Aggregate) each group
    const result = Object.entries(groupedData).map(([key, groupRows]) => {
        const summary = { [groupBy || 'group']: key };

        summaries.forEach((s: any) => {
            const { metric, column } = s;
            let value = 0;
            const values = groupRows.map(r => parseFloat(r[column])).filter(v => !isNaN(v));

            switch (metric) {
                case 'count':
                    value = groupRows.length;
                    break;
                case 'sum':
                    value = values.reduce((a, b) => a + b, 0);
                    break;
                case 'average':
                    value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                    break;
                case 'count_distinct':
                    const distinctValues = new Set(groupRows.map(r => r[column]));
                    value = distinctValues.size;
                    break;
            }
            summary[`${metric}_of_${column || 'rows'}`] = value;
        });

        return summary;
    });

    return result;
};


export async function POST(req: Request) {
    try {
        const { datasourceId, query } = await req.json();

        if (!datasourceId || !query) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseAdminClient();
        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data, date_format')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource?.processed_data) {
            throw new Error(`Could not find data for datasource: ${datasourceId}`);
        }

        const dateFormat = datasource.date_format || 'yyyy-MM-dd'; // Use saved format
        const result = performQuery(datasource.processed_data, query, dateFormat);

        return NextResponse.json(result);

    } catch (error) {
        console.error("API Custom Query Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}