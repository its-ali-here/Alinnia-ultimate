// app/api/query/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { Database } from 'duckdb';
import { format } from 'date-fns';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl, query, filters } = body;

    if (!fileUrl || !query) {
      return NextResponse.json({ error: 'Missing fileUrl or query' }, { status: 400 });
    }

    // In a real app, you might want to authenticate and check user permissions for the fileUrl here.
    const supabase = createSupabaseAdminClient();

    const db = new Database(':memory:');

    const runQuery = (sql: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all(sql, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    };

    await runQuery(`INSTALL httpfs; LOAD httpfs;`);

    // Replace the placeholder table with the actual file
    let finalQuery = query.replace(/my_table/g, `read_csv_auto('${fileUrl}')`);

    // Add filters to the query
    if (filters?.dateRange?.from && filters?.dateRange?.to && filters?.dateColumn) {
        const from = format(new Date(filters.dateRange.from), 'yyyy-MM-dd');
        const to = format(new Date(filters.dateRange.to), 'yyyy-MM-dd');
        // This is a simple implementation. For a production app, you'd want to
        // properly parse the SQL to safely inject WHERE clauses.
        const whereClause = `WHERE CAST("${filters.dateColumn}" AS DATE) BETWEEN '${from}' AND '${to}'`;
        
        const groupByIndex = finalQuery.toUpperCase().indexOf(' GROUP BY');
        if (groupByIndex > -1) {
            finalQuery = `${finalQuery.substring(0, groupByIndex)} ${whereClause} ${finalQuery.substring(groupByIndex)}`;
        } else {
            finalQuery = `${finalQuery} ${whereClause}`;
        }
    }
    
    console.log("Running SQL:", finalQuery);
    const result = await runQuery(finalQuery);

    db.close();

    return NextResponse.json({ data: result });

  } catch (err) {
    console.error('Server Query Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}