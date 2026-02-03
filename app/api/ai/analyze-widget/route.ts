import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { Database } from "duckdb-async";

export async function POST(req: Request) {
  try {
    const { widgetConfig, datasourceId } = await req.json();

    // 1. Fetch the file URL
    const supabase = createSupabaseAdminClient();
    const { data: ds } = await supabase
      .from('datasources')
      .select('storage_path')
      .eq('id', datasourceId)
      .single();

    if (!ds) throw new Error("Datasource not found");

    const { data: signedUrlData } = await supabase
      .storage
      .from('files') // Make sure this matches your bucket name
      .createSignedUrl(ds.storage_path, 60);

    const fileUrl = signedUrlData?.signedUrl;

    // 2. Run DuckDB to get the actual data points
    // We reuse the same logic as the frontend, but server-side
    const db = await Database.create(':memory:');
    await db.exec(`INSTALL httpfs; LOAD httpfs;`);
    
    // Reconstruct the SQL (Simplified for the AI analysis)
    // We just need the raw aggregated data to feed the LLM
    const { query, chartType } = widgetConfig;
    let sql = "";
    
    // Safe casting helper
    const safeCol = (col: string) => `TRY_CAST(NULLIF(regexp_replace("${col}", '[^0-9.-]', '', 'g'), '') AS DOUBLE)`;

    if (chartType === 'summary-card') {
        const agg = query.aggregationType || 'sum';
        sql = `SELECT '${agg}' as label, ${agg}(${safeCol(query.columnName)}) as value FROM read_csv_auto('${fileUrl}')`;
    } else {
        // Charts
        sql = `SELECT "${query.categoryKey}" as label, SUM(${safeCol(query.valueKey)}) as value 
               FROM read_csv_auto('${fileUrl}') 
               GROUP BY 1 
               ORDER BY 2 DESC 
               LIMIT 20`; // Limit to top 20 for AI context window
    }

    const result = await db.all(sql);
    const dataContext = JSON.stringify(result);

    // 3. Ask AI for the Story
    const prompt = `
      You are a Business Analyst. Analyze this dataset from a dashboard widget.
      
      WIDGET TITLE: "${widgetConfig.title}"
      DATA (Top 20 rows): ${dataContext}
      
      TASK:
      Write a 2-sentence insight. 
      1. Mention the most significant trend or outlier.
      2. Keep it professional and direct.
      3. Do NOT mention "rows" or "database". Talk about "Sales", "Revenue", etc.
    `;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
    });

    return new Response(JSON.stringify({ insight: text }));

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}