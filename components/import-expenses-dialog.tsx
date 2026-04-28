"use client"

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { Project } from "@/lib/project-queries"
import { Upload, Sparkles, Trash2, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react"

interface ParsedRow {
  date: string
  description: string
  amount: number
  category: string
  vendor: string | null
  unit_rate: number | null
  quantity: number | null
  unit: string | null
  _keep: boolean  // local toggle for preview
}

interface ParseResult {
  expenses: Omit<ParsedRow, "_keep">[]
  detected_currency: string
  detected_total: number | null
  warnings: string[]
}

type Step = "input" | "parsing" | "preview" | "importing" | "done"

interface Props {
  project: Project
  onImported: () => void
  trigger: React.ReactNode
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "PKR" ? "USD" : currency, // Intl doesn't support PKR well; handle below
    maximumFractionDigits: 0,
  }).format(n).replace("US$", currency === "PKR" ? "Rs " : "")
}

function fmtAmt(n: number, currency: string) {
  if (currency === "PKR") return `Rs ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  return `${currency} ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export function ImportExpensesDialog({ project, onImported, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("input")
  const [csvText, setCsvText] = useState("")
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const [useBudget, setUseBudget] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText(ev.target?.result as string ?? "")
    reader.readAsText(file)
  }

  const handleParse = async () => {
    if (!csvText.trim()) return
    setStep("parsing")
    setError(null)
    try {
      const res = await fetch("/api/import/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Parsing failed")
      }
      const result: ParseResult = await res.json()
      setParseResult(result)
      setRows(result.expenses.map(e => ({ ...e, _keep: true })))
      setStep("preview")
    } catch (err: any) {
      setError(err.message)
      setStep("input")
    }
  }

  const toggleRow = (i: number) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, _keep: !r._keep } : r))
  }

  const updateAmount = (i: number, val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) setRows(prev => prev.map((r, idx) => idx === i ? { ...r, amount: n } : r))
  }

  const updateCategory = (i: number, val: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, category: val } : r))
  }

  const handleImport = async () => {
    const toImport = rows.filter(r => r._keep)
    if (toImport.length === 0) return
    setStep("importing")
    const supabase = createSupabaseBrowserClient()

    // Optionally update project budget
    if (useBudget && parseResult?.detected_total) {
      await supabase
        .from("projects")
        .update({ budget: parseResult.detected_total, currency: parseResult.detected_currency })
        .eq("id", project.id)
    } else if (parseResult?.detected_currency && parseResult.detected_currency !== "USD") {
      await supabase
        .from("projects")
        .update({ currency: parseResult.detected_currency })
        .eq("id", project.id)
    }

    // Bulk insert in chunks of 50
    const chunkSize = 50
    for (let i = 0; i < toImport.length; i += chunkSize) {
      const chunk = toImport.slice(i, i + chunkSize).map(r => ({
        project_id: project.id,
        description: r.description,
        amount: r.amount,
        category: r.category,
        vendor: r.vendor,
        date: r.date,
        unit_rate: r.unit_rate,
        quantity: r.quantity,
        unit: r.unit,
      }))
      await supabase.from("expenses").insert(chunk)
    }

    setImportedCount(toImport.length)
    setStep("done")
    onImported()
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setStep("input")
      setCsvText("")
      setParseResult(null)
      setRows([])
      setError(null)
      setUseBudget(false)
    }, 300)
  }

  const keptRows = rows.filter(r => r._keep)
  const currency = parseResult?.detected_currency ?? "USD"

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Import expenses with AI
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP: INPUT ── */}
        {step === "input" && (
          <div className="flex flex-col gap-4 overflow-y-auto flex-1">
            <p className="text-sm text-muted-foreground">
              Export your spreadsheet as CSV, then paste the content below — or upload the file directly.
              Groq AI will extract and normalise every expense row automatically.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={"Paste CSV content here…\n\nDate,Category,Account,Amount,Particulars\n09 Jan 2025,Labour,Altaf Atta,(Rs 100000),Quotation 1\n…"}
              className="min-h-[220px] w-full resize-y rounded-lg border border-border bg-muted p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition-colors"
            />

            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Upload CSV file
              </button>
              <span className="text-xs text-muted-foreground">.csv, .txt, .tsv accepted</span>
              <button
                onClick={handleParse}
                disabled={!csvText.trim()}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5" /> Parse with AI
              </button>
            </div>

            <div className="rounded-lg bg-muted/60 border border-border p-3">
              <p className="text-[11px] font-semibold text-foreground mb-1">Supported formats</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Apple Numbers · Microsoft Excel · Google Sheets · Any spreadsheet exported as CSV or TSV.
                Works with messy column names, PKR bracket amounts like (Rs 100,000), mixed date formats, and any language.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: PARSING ── */}
        {step === "parsing" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Groq AI is reading your data…</p>
            <p className="text-xs text-muted-foreground">Usually takes 3–8 seconds</p>
          </div>
        )}

        {/* ── STEP: PREVIEW ── */}
        {step === "preview" && parseResult && (
          <div className="flex flex-col gap-3 overflow-hidden flex-1 min-h-0">
            {/* Summary banner */}
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800">
                  {parseResult.expenses.length} expenses found · Currency: {currency}
                </p>
                {parseResult.warnings.length > 0 && (
                  <p className="text-[10px] text-emerald-700 mt-0.5">{parseResult.warnings.length} rows skipped — see below</p>
                )}
              </div>
              <button onClick={() => setStep("input")} className="flex items-center gap-1 text-[10px] text-emerald-700 hover:underline flex-shrink-0">
                <ChevronLeft className="h-3 w-3" /> Edit
              </button>
            </div>

            {/* Detected budget suggestion */}
            {parseResult.detected_total && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2.5">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Starting balance detected: {fmtAmt(parseResult.detected_total, currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Set this as your project budget?</p>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={useBudget} onChange={e => setUseBudget(e.target.checked)} className="accent-primary" />
                  Yes, update budget
                </label>
              </div>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-semibold text-amber-700 mb-1">Skipped rows</p>
                {parseResult.warnings.map((w, i) => (
                  <p key={i} className="text-[10px] text-amber-700">· {w}</p>
                ))}
              </div>
            )}

            {/* Preview table */}
            <div className="overflow-auto flex-1 rounded-xl border border-border">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-8">
                      <input
                        type="checkbox"
                        checked={rows.every(r => r._keep)}
                        onChange={e => setRows(prev => prev.map(r => ({ ...r, _keep: e.target.checked })))}
                        className="accent-primary"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Vendor</th>
                    <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                    <th className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, i) => (
                    <tr key={i} className={`transition-colors ${row._keep ? "hover:bg-muted/40" : "opacity-40 bg-muted/20"}`}>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={row._keep} onChange={() => toggleRow(i)} className="accent-primary" />
                      </td>
                      <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{row.date}</td>
                      <td className="px-2 py-2 max-w-[200px]">
                        <p className="truncate text-foreground" title={row.description}>{row.description}</p>
                        {row.quantity && row.unit_rate && (
                          <p className="text-[10px] text-muted-foreground">{row.quantity} {row.unit ?? 'units'} @ {fmtAmt(row.unit_rate, currency)}</p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={row.category}
                          onChange={e => updateCategory(i, e.target.value)}
                          className="w-full rounded border border-border bg-transparent px-1.5 py-0.5 text-xs focus:border-primary outline-none"
                        />
                      </td>
                      <td className="px-2 py-2 text-muted-foreground text-[11px]">{row.vendor ?? "—"}</td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={row.amount}
                          onChange={e => updateAmount(i, e.target.value)}
                          className="w-24 rounded border border-border bg-transparent px-1.5 py-0.5 text-right text-xs focus:border-primary outline-none font-mono"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button onClick={() => toggleRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                {keptRows.length} of {rows.length} rows selected ·{" "}
                Total: {fmtAmt(keptRows.reduce((s, r) => s + r.amount, 0), currency)}
              </p>
              <button
                onClick={handleImport}
                disabled={keptRows.length === 0}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                Import {keptRows.length} expense{keptRows.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: IMPORTING ── */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Saving expenses…</p>
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{importedCount} expenses imported</p>
              <p className="text-sm text-muted-foreground mt-1">Your cash flow and budget overview are now up to date.</p>
            </div>
            <button onClick={handleClose} className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
