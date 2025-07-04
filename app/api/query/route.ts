// app/api/analytics/query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

// --- NEW: A flexible date parser that uses a format string ---
const parseDateWithFormat = (dateString: string, format: string): Date | null => {
    const parts = dateString.split(/[-/]/);
    const formatParts = format.toLowerCase().split(/[-/]/);

    if (parts.length !== 3 || formatParts.length !== 3) return null;

    const dayIndex = formatParts.indexOf('dd');
    const monthIndex = formatParts.indexOf('mm');
    const yearIndex = formatParts.indexOf('yyyy');

    if (dayIndex === -1 || monthIndex === -1 || yearIndex === -1) return null;

    // Note: new Date() expects (year, month - 1, day)
    const year = parseInt(parts[yearIndex], 10);
    const month = parseInt(parts[monthIndex], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[dayIndex], 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
    }
    return null;
};

// Helper function to apply all filters
const applyFilters = (data: any[], filters: any) => {
  let filteredData = data;

  // Apply Date Range Filter if all required info is present
  if (filters?.dateRange && filters.dateColumn && filters.dateFormat) {
    const { from, to } = filters.dateRange;
    const startDate = new Date(from);
    const endDate = new Date(to);

    filteredData = filteredData.filter(row => {
      // --- FIX: Use our new flexible parser with the provided format ---
      const rowDate = parseDateWithFormat(row[filters.dateColumn], filters.dateFormat);
      return rowDate && rowDate >= startDate && rowDate <= endDate;
    });
  }

  return filteredData;
};

// (The rest of the file remains the same)

const processChartData = (data: any[], categoryKey: string, valueKey: string) => {
  if (!data || data.length === 0) return [];
  const result = data.reduce((acc, row) => {
      const category = row[categoryKey];
      const value = parseFloat(row[valueKey]) || 0;
      if (category) {
          if (!acc[category]) acc[category] = 0;
          acc[category] += value;
      }
      return acc;
  }, {} as Record<string, number>);
  return Object.entries(result).map(([key, sum]) => ({ [categoryKey]: key, [valueKey]: sum }));
};

const processMapData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    return data;
};

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();

    try {
        const { datasourceId, query, chartType, categoryKey, valueKey, filters } = await req.json();

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

        const filteredData = applyFilters(datasource.processed_data, filters);

        let responseData;
        if (chartType === 'map' && query?.dimensions) {
            responseData = processMapData(filteredData);
        } else if (categoryKey && valueKey) {
            responseData = processChartData(filteredData, categoryKey, valueKey);
        } else {
            // It's possible for summary cards to have no chartType.
            // In this case, we can just return the filtered data.
            // The frontend will handle the aggregation.
            responseData = filteredData;
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