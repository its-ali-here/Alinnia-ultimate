import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import Papa from "papaparse"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 60

// ─── Schemas ─────────────────────────────────────────────────────────────────

const MappingSchema = z.object({
  date_col: z.string().nullable().default(null),
  amount_col: z.string(),
  description_col: z.string(),
  category_col: z.string().nullable().default(null),
  vendor_col: z.string().nullable().default(null),
  notes_col: z.string().nullable().default(null),
  quantity_col: z.string().nullable().default(null),
  unit_rate_col: z.string().nullable().default(null),
  unit_col: z.string().nullable().default(null),
  currency: z.string().default("USD"),
  amount_uses_brackets: z.boolean().default(false),
})

const OverrideSchema = z.object({
  idx: z.number().int(),           // 0-based index into parsed.data
  skip: z.boolean().optional(),
  amount: z.coerce.number().optional(),
  category: z.string().optional(),
  vendor: z.string().nullable().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().nullable().optional(),
  note: z.string().optional(),     // AI's human-readable reason (for warnings)
})

const AIResponseSchema = z.object({
  mapping: MappingSchema,
  row_overrides: z.array(OverrideSchema).default([]),
  detected_currency: z.string().default("USD"),
  detected_total: z.coerce.number().nullable().default(null),
  warnings: z.array(z.string()).default([]),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractFirstJson(text: string): unknown {
  // Find the outermost complete JSON object
  let depth = 0
  let start = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") { if (start === -1) start = i; depth++ }
    else if (text[i] === "}") { depth--; if (depth === 0 && start !== -1) return JSON.parse(text.slice(start, i + 1)) }
  }
  throw new Error("No complete JSON object found in response")
}

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0
  let s = raw.trim()
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1)
  // Handle South Asian shorthand: 1L = 100000, 1.5L = 150000, 50K = 50000
  const lakh = s.match(/^([0-9.]+)\s*[Ll]$/)
  if (lakh) return parseFloat(lakh[1]) * 100_000
  const thou = s.match(/^([0-9.]+)\s*[Kk]$/)
  if (thou) return parseFloat(thou[1]) * 1_000
  // Strip all non-numeric except decimal point
  s = s.replace(/[^0-9.]/g, "")
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

function parseDate(raw: string | undefined): string {
  if (!raw || !raw.trim()) return new Date().toISOString().split("T")[0]
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
  const textDate = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (textDate) {
    const [, d, mon, y] = textDate
    const mIdx = months.indexOf(mon.toLowerCase().slice(0, 3))
    if (mIdx >= 0) return `${y}-${String(mIdx + 1).padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  const ts = Date.parse(s)
  return isNaN(ts) ? new Date().toISOString().split("T")[0] : new Date(ts).toISOString().split("T")[0]
}

function guessMappingFromHeaders(headers: string[]): z.infer<typeof MappingSchema> {
  const find = (...terms: string[]) =>
    headers.find(h => terms.some(t => h.toLowerCase().includes(t.toLowerCase()))) ?? null
  return {
    date_col: find("date", "dt", "day"),
    amount_col: find("amount", "total", "price", "cost", "value", "rs", "pkr", "usd") ?? headers[headers.length - 1],
    description_col: find("description", "particulars", "item", "details", "name", "narration") ?? headers[0],
    category_col: find("category", "type", "phase", "head", "account"),
    vendor_col: find("vendor", "supplier", "account", "payee", "by", "from"),
    notes_col: find("notes", "remarks", "memo", "comment", "detail"),
    quantity_col: find("quantity", "qty"),
    unit_rate_col: find("rate", "unit_rate", "unit rate", "price per"),
    unit_col: find("unit", "uom", "measure"),
    currency: "USD",
    amount_uses_brackets: false,
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { csvText } = await req.json()
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "No CSV text provided" }, { status: 400 })
  }

  // ── 1. Parse CSV locally — fast, handles all edge cases ──────────────────
  const csvParsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  })

  if (!csvParsed.data || csvParsed.data.length === 0) {
    return NextResponse.json({ error: "No rows found in the CSV" }, { status: 400 })
  }

  const headers = Object.keys(csvParsed.data[0])
  // Truncate to ~40KB to stay in token budget while still reading the full dataset
  const compactData = csvText.slice(0, 40_000)

  // ── 2. AI reads the FULL dataset — outputs only mapping + exceptions ──────
  //
  // Key principle: AI reads everything (catches all irregular patterns)
  //                AI writes almost nothing (mapping + sparse corrections only)
  //
  // Output size is bounded by the NUMBER OF EXCEPTIONS, not the number of rows.
  // A 500-row spreadsheet with 10 messy rows → ~400 tokens output, never truncated.
  const prompt = `You are an expert at parsing construction expense spreadsheets, including messy real-world data.

Read the FULL dataset below carefully. Look for:
- Irregular amount formats: "1.5L" (= 150,000), "50K" (= 50,000), bracket notation "(Rs 100,000)", mixed currencies
- Rows that are subtotals, headers, or running balances that should be skipped
- Category values that need normalisation (e.g. "TMT bars" → Steel, "Mazhar" in category → vendor)
- Missing dates (leave null — the importer will use today's date)
- Any embedded notes in the amount or description column

Return ONLY a single JSON object. Do NOT reproduce the row data.
Only include rows in "row_overrides" that cannot be handled by a simple column mapping.

{
  "mapping": {
    "date_col":        null or exact column header string,
    "amount_col":      exact column header string (required),
    "description_col": exact column header string (required),
    "category_col":    null or exact column header string,
    "vendor_col":      null or exact column header string,
    "notes_col":       null or exact column header string,
    "quantity_col":    null or exact column header string,
    "unit_rate_col":   null or exact column header string,
    "unit_col":        null or exact column header string,
    "currency":        3-letter code: "PKR" if Rs/PKR present, else "USD" etc,
    "amount_uses_brackets": true if amounts appear as (100000), else false
  },
  "row_overrides": [
    {
      "idx": 0,           // 0-based row index (NOT the row number in the CSV, but parsed data index)
      "skip": true,       // include ONLY if this row should be excluded (subtotal, header, etc.)
      "amount": 150000,   // include ONLY if the raw amount cell is non-standard ("1.5L", "one lakh", etc.)
      "category": "Steel", // include ONLY if the column value needs correcting
      "vendor": "Rafiq",  // include ONLY if vendor needs correcting
      "description": "...", // include ONLY if description needs correcting
      "notes": "...",     // any extra context worth preserving
      "note": "reason"    // your human-readable explanation (used for warnings)
    }
  ],
  "detected_currency": "PKR",
  "detected_total": null,
  "warnings": ["Row 5: skipped — appears to be a running total"]
}

COLUMN HEADERS: ${JSON.stringify(headers)}

FULL DATASET:
${compactData}`

  let aiResponse: z.infer<typeof AIResponseSchema> | null = null

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    })

    const raw = extractFirstJson(text)
    const result = AIResponseSchema.safeParse(raw)

    if (result.success) {
      aiResponse = result.data
    } else {
      console.error("AI response schema mismatch:", result.error.flatten())
      // Try to at least extract the mapping
      const rawObj = raw as Record<string, unknown>
      const mappingResult = MappingSchema.safeParse(rawObj?.mapping)
      if (mappingResult.success) {
        aiResponse = {
          mapping: mappingResult.data,
          row_overrides: [],
          detected_currency: typeof rawObj?.detected_currency === "string" ? rawObj.detected_currency : "USD",
          detected_total: null,
          warnings: ["Some AI corrections could not be applied — basic column mapping used."],
        }
      }
    }
  } catch (err) {
    console.error("AI analysis error:", err)
  }

  // Fall back to heuristic mapping if AI failed entirely
  const mapping = aiResponse?.mapping ?? guessMappingFromHeaders(headers)
  const overrides = aiResponse?.row_overrides ?? []
  const warnings = aiResponse?.warnings ?? []

  // Build an index of overrides keyed by row idx for O(1) lookup
  const overrideMap = new Map(overrides.map(o => [o.idx, o]))

  // ── 3. Apply mapping + AI corrections to every row locally ───────────────
  const today = new Date().toISOString().split("T")[0]
  const expenses = []

  for (let i = 0; i < csvParsed.data.length; i++) {
    const row = csvParsed.data[i]
    const override = overrideMap.get(i)

    // Skip rows flagged by AI
    if (override?.skip) {
      if (override.note) warnings.push(`Row ${i + 2}: skipped — ${override.note}`)
      continue
    }

    // Amount: prefer AI override (handles "1.5L", "50K", etc.), then column mapping
    const rawAmount = mapping.amount_col ? row[mapping.amount_col] : ""
    const amount = override?.amount ?? parseAmount(rawAmount)

    if (amount === 0) {
      warnings.push(`Row ${i + 2}: skipped — zero or unreadable amount ("${rawAmount || "empty"}")`)
      continue
    }

    const date = override?.date
      ?? (mapping.date_col ? parseDate(row[mapping.date_col]) : today)

    const description = override?.description
      ?? (mapping.description_col ? (row[mapping.description_col] || "") : "")

    const category = override?.category
      ?? (mapping.category_col ? (row[mapping.category_col] || "Other") : "Other")

    const vendor = override?.vendor !== undefined
      ? override.vendor
      : (mapping.vendor_col ? (row[mapping.vendor_col] || null) : null)

    const notes = override?.notes !== undefined
      ? override.notes
      : (mapping.notes_col ? (row[mapping.notes_col] || null) : null)

    const quantity = mapping.quantity_col ? parseAmount(row[mapping.quantity_col]) || null : null
    const unit_rate = mapping.unit_rate_col ? parseAmount(row[mapping.unit_rate_col]) || null : null
    const unit = mapping.unit_col ? (row[mapping.unit_col] || null) : null

    expenses.push({ date, description, amount, category, vendor, notes, quantity, unit_rate, unit })
  }

  return NextResponse.json({
    expenses,
    detected_currency: aiResponse?.detected_currency ?? mapping.currency,
    detected_total: aiResponse?.detected_total ?? null,
    warnings,
  })
}
