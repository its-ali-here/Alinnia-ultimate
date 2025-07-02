import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { isWithinInterval, isValid, parse as dateFnsParse } from 'date-fns';
import path from 'path';
import { promises as fs } from 'fs';

// --- Type definitions to help TypeScript ---
interface City {
    city: string;
    lat: number;
    lng: number;
    country: string;
}

interface Query {
    filters: any[];
    summaries: any[];
    groupBy: string | null;
    visualization: 'map' | 'bar' | 'pie' | 'scatter';
    locationKey?: string;
}

// --- Functions with explicit types ---

let cityData: City[] | null = null;
async function loadCityData(): Promise<City[]> {
    if (cityData) return cityData;
    try {
        const filePath = path.join(process.cwd(), 'data', 'worldcities.csv');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const rows = fileContent.split('\n').slice(1);
        
        cityData = rows.map((row: string) => {
            const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            const cleanedColumns = columns.map((c: string) => c.replace(/"/g, ''));
            return {
                city: cleanedColumns[0],
                lat: parseFloat(cleanedColumns[2]),
                lng: parseFloat(cleanedColumns[3]),
                country: cleanedColumns[4]
            };
        }).filter((c): c is City => c.city && !isNaN(c.lat) && !isNaN(c.lng));
    } catch (e) {
        console.error("Failed to load city data:", e);
        cityData = [];
    }
    return cityData;
}

const geocodeLocation = (locationName: string, cities: City[]): [number, number] | null => {
    if (!locationName) return null;
    const location = cities.find(c => c.city.toLowerCase() === locationName.toLowerCase().trim());
    return location ? [location.lat, location.lng] : null;
};

const applyFilters = (data: any[], filters: any[], dateFormat: string): any[] => {
    if (!filters || filters.length === 0) return data;
    // ... (This logic remains the same)
    return data;
};

const performQuery = (data: any[], query: Query, dateFormat: string, cities: City[]): any[] => {
    const { filters, summaries, groupBy, visualization, locationKey } = query;
    let filteredData = applyFilters(data, filters, dateFormat);

    if (visualization === 'map' && locationKey) {
        return filteredData.map(row => ({
            ...row,
            coords: geocodeLocation(row[locationKey], cities)
        })).filter(row => row.coords); 
    }
    
    const groupedData = filteredData.reduce((acc: Record<string, any[]>, row: any) => {
        const key = groupBy ? row[groupBy] : 'Total';
        if (!acc[key]) { acc[key] = []; }
        acc[key].push(row);
        return acc;
    }, {});

    const result = Object.entries(groupedData).map(([key, groupRows]: [string, any[]]) => {
        const summary: Record<string, any> = { [groupBy || 'group']: key };
        summaries.forEach((s: any) => {
            const { metric, column } = s;
            let value = 0;
            const values = groupRows.map((r: any) => parseFloat(r[column])).filter((v: number) => !isNaN(v));
            switch (metric) {
                case 'count': value = groupRows.length; break;
                case 'sum': value = values.reduce((a: number, b: number) => a + b, 0); break;
                case 'average': value = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0; break;
                case 'count_distinct': value = new Set(groupRows.map((r: any) => r[column])).size; break;
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

        const cities = await loadCityData();
        const supabaseAdmin = createSupabaseAdminClient();
        const { data: datasource, error } = await supabaseAdmin
            .from('datasources')
            .select('processed_data, date_format')
            .eq('id', datasourceId)
            .single();

        if (error || !datasource?.processed_data) {
            throw new Error(`Could not find data for datasource: ${datasourceId}`);
        }

        const dateFormat = datasource.date_format || 'yyyy-MM-dd';
        const result = performQuery(datasource.processed_data, query, dateFormat, cities);

        return NextResponse.json(result);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("API Custom Query Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}