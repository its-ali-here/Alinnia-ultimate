import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// This is our simple CSV parser from the project.
// NOTE: For this to work, you MUST copy your `lib/csv-parser.ts` file
// into the `supabase/functions/_shared/` directory and rename it to `csv-parser.ts`.
import { parseCsv } from '../_shared/csv-parser.ts'

console.log("process-csv function invoked");

Deno.serve(async (req) => {
  // This is required for security and to handle pre-flight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { datasourceId } = await req.json();
    if (!datasourceId) {
      throw new Error("datasourceId is required.");
    }

    // Create a Supabase client with the Service Role Key for admin-level access.
    // This is secure because this code only runs on Supabase servers.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get the datasource record to find where the file is stored.
    const { data: datasource, error: fetchError } = await supabaseAdmin
      .from('datasources')
      .select('storage_path, file_name')
      .eq('id', datasourceId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch datasource: ${fetchError.message}`);

    // 2. Download the actual CSV file from Supabase Storage.
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('files') // Make sure this matches your bucket name
      .download(datasource.storage_path);

    if (downloadError) throw new Error(`Failed to download file: ${downloadError.message}`);

    // 3. Parse the CSV file text.
    const csvText = await fileData.text();
    const { headers, rows, rowCount, error: parseError } = parseCsv(csvText);

    if (parseError) throw new Error(`CSV parsing error: ${parseError}`);

    // 4. Update the datasource record with the results.
    const { error: updateError } = await supabaseAdmin
      .from('datasources')
      .update({
        status: 'ready',
        column_definitions: headers, // Storing the headers as column definitions
        row_count: rowCount,
        processed_data: rows, // Save the actual parsed rows into our new column
      })
      .eq('id', datasourceId);

    if (updateError) throw new Error(`Failed to update datasource: ${updateError.message}`);

    // 5. Return a success message.
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