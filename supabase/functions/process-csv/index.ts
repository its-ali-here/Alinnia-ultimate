import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { parseCsv } from '../_shared/csv-parser.ts'
// Note: These imports are now correctly recognized because of deno.jsonc
import { readFileSync } from 'node:fs'
import { dirname, join } from 'https://deno.land/std@0.224.0/path/mod.ts';

let cityData: any[] | null = null;
function loadCityData() {
    if (cityData) return cityData;
    try {
        const currentPath = dirname(import.meta.url);
        const filePath = join(currentPath, '../_shared/worldcities.csv').replace(/^file:\/\//, '');
        const fileContent = readFileSync(filePath, 'utf8');
        
        const rows = fileContent.split('\n').slice(1);
        cityData = rows.map((row: string) => {
            const columns = row.split('","').map(c => c.replace(/"/g, ''));
            return {
                city: columns[0],
                lat: parseFloat(columns[2]),
                lng: parseFloat(columns[3]),
                country: columns[4]
            };
        }).filter(c => c.city && !isNaN(c.lat) && !isNaN(c.lng));
    } catch (e) {
        console.error("Fatal Error: Could not load city data from _shared/worldcities.csv.", e);
        cityData = [];
    }
    return cityData;
}

const geocodeLocation = (locationName: string, cities: any[]): [number, number] | null => {
    if (!locationName) return null;
    const location = cities.find(c => c.city.toLowerCase() === locationName.toLowerCase().trim());
    return location ? [location.lat, location.lng] : null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { datasourceId } = await req.json();
    if (!datasourceId) throw new Error("datasourceId is required.");

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const cities = loadCityData();

    const { data: datasource, error: fetchError } = await supabaseAdmin
      .from('datasources')
      .select('storage_path, file_name, column_definitions')
      .eq('id', datasourceId)
      .single();
    if (fetchError) throw new Error(`Failed to fetch datasource: ${fetchError.message}`);

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage.from('files').download(datasource.storage_path);
    if (downloadError) throw new Error(`Failed to download file: ${downloadError.message}`);

    const csvText = await fileData.text();
    const { rows, rowCount, error: parseError } = parseCsv(csvText);
    if (parseError) throw new Error(`CSV parsing error: ${parseError}`);

    const locationColumn = datasource.column_definitions.find((c: string) => 
        ['city', 'location', 'country', 'place'].includes(c.toLowerCase())
    );

    const processedRows = rows.map(row => {
        const coords = locationColumn ? geocodeLocation(row[locationColumn], cities) : null;
        return {
            ...row,
            latitude: coords ? coords[0] : null,
            longitude: coords ? coords[1] : null,
        };
    });

    const { error: updateError } = await supabaseAdmin
      .from('datasources')
      .update({
        status: 'ready',
        row_count: rowCount,
        processed_data: processedRows,
      })
      .eq('id', datasourceId);
    if (updateError) throw new Error(`Failed to update datasource: ${updateError.message}`);

    return new Response(JSON.stringify({ message: `Successfully processed ${datasource.file_name}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in process-csv function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})