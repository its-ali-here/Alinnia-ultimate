import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 60

const ParsedExpenseSchema = z.object({
  expenses: z.array(
    z.object({
      date: z.string().describe("ISO date YYYY-MM-DD"),
      description: z.string(),
      amount: z.number().positive().describe("Positive number, no currency symbols"),
      category: z.string(),
      vendor: z.string().nullable(),
      unit_rate: z.number().nullable().describe("Per-unit rate if provided"),
      quantity: z.number().nullable().describe("Quantity if provided"),
      unit: z.string().nullable().describe("Unit of measure e.g. bags, kg, sqft"),
    })
  ),
  detected_currency: z.string().describe("3-letter currency code e.g. PKR, USD, GBP"),
  detected_total: z.number().nullable().describe("Starting balance/budget if visible in the data"),
  warnings: z.array(z.string()).describe("Any rows skipped or issues found"),
})

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { csvText } = await req.json()
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "No CSV text provided" }, { status: 400 })
  }

  // Limit to avoid excessive token usage (~50KB is plenty for any realistic expense sheet)
  const truncated = csvText.slice(0, 50000)

  try {
    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: ParsedExpenseSchema,
      prompt: `You are parsing construction expense data exported from a spreadsheet.

Extract every expense/transaction row and return structured data.

PARSING RULES:
- date: Convert to YYYY-MM-DD. "09 Jan 2025" → "2025-01-09", "9/1/25" → "2025-01-09"
- amount: Always a positive number. Strip currency symbols (Rs, PKR, $, £, €, AED), commas, and bracket notation. "(Rs 100,000)" and "Rs 100,000" both → 100000. If Amount column is negative (expense), take absolute value.
- description: Use the Particulars/Description/Notes column if present. If empty, combine Category + " - " + Account/Vendor.
- category: Use the Category column value exactly as-is. Do NOT normalize or rename categories.
- vendor: Account, Vendor, Supplier, or Payee column. null if absent.
- unit_rate: Numeric value from Rate/Unit Price column. null if absent or zero.
- quantity: Numeric value from Quantity/Qty column. null if absent or zero.
- unit: Unit of measurement if mentioned (bags, kg, sqft, m², pcs, truckloads). null if not mentioned.
- detected_currency: Infer from currency symbols in the data. Default "USD" if unclear.
- detected_total: If there is a starting balance or budget total visible at the top, return it. Otherwise null.
- warnings: List any rows you skipped (header rows, total rows, rows with no amount) and why.

SKIP:
- Header rows (row contains column names, not values)
- Summary/total rows
- Rows with no amount or zero amount
- Rows that are clearly income/deposits (not expenses) — unless the dataset only has expenses

DATA:
${truncated}`,
    })

    return NextResponse.json(object)
  } catch (err: any) {
    console.error("Groq parse error:", err)
    return NextResponse.json({ error: err.message ?? "AI parsing failed" }, { status: 500 })
  }
}
