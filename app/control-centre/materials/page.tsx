"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import {
  getProjectExpenses,
  getMaterialStock,
  upsertMaterialStock,
  updateExpenseDeliveryStatus,
} from "@/lib/project-queries"
import type { Expense, MaterialStock } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Truck, Package, Edit2, Check } from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────

const MATERIAL_CATEGORIES = [
  'Bricks', 'Cement', 'Steel', 'Sand', 'Crush',
  'Plumbing', 'Electrical', 'Waterproofing', 'Materials',
]

const CAT_ICON: Record<string, string> = {
  Bricks: '🧱', Cement: '🏗️', Steel: '⚙️', Sand: '🏖️', Crush: '🪨',
  Plumbing: '🚿', Electrical: '🔌', Waterproofing: '🛡️', Materials: '📦',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryRow {
  name: string
  icon: string
  txnCount: number
  totalSpent: number
  totalPurchasedQty: number
  inTransitQty: number
  inTransitOrders: Expense[]
  onHandQty: number | null
  reorderThreshold: number | null
  leadTimeDays: number
  unit: string
  stockId: string | null
  lastVendor: string | null
  lastDate: string | null
  needsReorder: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function deliveryBadgeClass(s: Expense['delivery_status']) {
  if (s === 'ordered') return 'bg-amber-100 text-amber-700'
  if (s === 'consumed') return 'bg-muted text-muted-foreground'
  return 'bg-emerald-100 text-emerald-700'
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MaterialsPage() {
  const { activeProject } = useActiveProject()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stock, setStock] = useState<MaterialStock[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock')
  const [editingStock, setEditingStock] = useState<{ name: string; qty: string; unit: string } | null>(null)
  const [editingThreshold, setEditingThreshold] = useState<{ name: string; threshold: string } | null>(null)
  const [updatingDelivery, setUpdatingDelivery] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement | null>(null)

  const loadData = async () => {
    if (!activeProject) { setLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    const [exp, stk] = await Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      getMaterialStock(supabase, activeProject.id),
    ])
    setExpenses(exp.filter(e => MATERIAL_CATEGORIES.includes(e.category)))
    setStock(stk)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [activeProject])

  useEffect(() => {
    if (editingStock) editInputRef.current?.focus()
  }, [editingStock])

  // ── Derived per-category rows ────────────────────────────────────────────

  const categoryRows = useMemo((): CategoryRow[] => {
    const result: CategoryRow[] = []
    for (const cat of MATERIAL_CATEGORIES) {
      const catExp = expenses.filter(e => e.category === cat)
      if (catExp.length === 0) continue

      const delivered = catExp.filter(e => !e.delivery_status || e.delivery_status === 'delivered' || e.delivery_status === 'consumed')
      const ordered = catExp.filter(e => e.delivery_status === 'ordered')

      const totalPurchasedQty = delivered.reduce((s, e) => s + (e.quantity ?? 0), 0)
      const inTransitQty = ordered.reduce((s, e) => s + (e.quantity ?? 0), 0)
      const totalSpent = catExp.reduce((s, e) => s + e.amount, 0)

      const stockRecord = stock.find(s => s.material_name === cat)
      const sorted = [...catExp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const unitFromExp = catExp.find(e => e.unit)?.unit ?? ''

      const onHandQty = stockRecord?.on_hand_qty ?? null
      const threshold = stockRecord?.reorder_threshold ?? null
      const needsReorder = onHandQty !== null && threshold !== null && onHandQty < threshold

      result.push({
        name: cat,
        icon: CAT_ICON[cat] ?? '📦',
        txnCount: catExp.length,
        totalSpent,
        totalPurchasedQty,
        inTransitQty,
        inTransitOrders: ordered,
        onHandQty,
        reorderThreshold: threshold,
        leadTimeDays: stockRecord?.lead_time_days ?? 2,
        unit: stockRecord?.unit || unitFromExp,
        stockId: stockRecord?.id ?? null,
        lastVendor: sorted[0]?.vendor ?? null,
        lastDate: sorted[0]?.date ?? null,
        needsReorder,
      })
    }
    return result
  }, [expenses, stock])

  const needsReorderCount = categoryRows.filter(r => r.needsReorder).length
  const inTransitCount = categoryRows.reduce((s, r) => s + r.inTransitOrders.length, 0)

  // ── Handlers ────────────────────────────────────────────────────────────

  const saveOnHand = async (materialName: string, qty: string, unit: string) => {
    const parsed = parseFloat(qty)
    if (isNaN(parsed) || !activeProject) return
    const supabase = createSupabaseBrowserClient()
    await upsertMaterialStock(supabase, activeProject.id, materialName, { on_hand_qty: parsed, unit })
    setEditingStock(null)
    await loadData()
  }

  const saveThreshold = async (materialName: string, threshold: string) => {
    const parsed = threshold === '' ? null : parseFloat(threshold)
    if (!activeProject) return
    const supabase = createSupabaseBrowserClient()
    const row = categoryRows.find(r => r.name === materialName)
    await upsertMaterialStock(supabase, activeProject.id, materialName, {
      reorder_threshold: isNaN(parsed as number) ? null : parsed,
      unit: row?.unit ?? '',
    })
    setEditingThreshold(null)
    await loadData()
  }

  const confirmDelivery = async (expense: Expense) => {
    if (!activeProject) return
    setUpdatingDelivery(expense.id)
    const supabase = createSupabaseBrowserClient()
    const today = new Date().toISOString().split('T')[0]
    await updateExpenseDeliveryStatus(supabase, expense.id, 'delivered', today)

    // Increment on-hand if quantity exists and stock record exists
    if (expense.quantity && expense.quantity > 0) {
      const existing = stock.find(s => s.material_name === expense.category)
      if (existing) {
        await upsertMaterialStock(supabase, activeProject.id, expense.category, {
          on_hand_qty: existing.on_hand_qty + expense.quantity,
        })
      }
    }

    setUpdatingDelivery(null)
    await loadData()
  }

  const changeDeliveryStatus = async (expense: Expense, newStatus: 'ordered' | 'delivered' | 'consumed') => {
    if (!activeProject || newStatus === expense.delivery_status) return
    setUpdatingDelivery(expense.id)
    const supabase = createSupabaseBrowserClient()
    const today = new Date().toISOString().split('T')[0]
    await updateExpenseDeliveryStatus(supabase, expense.id, newStatus, newStatus === 'delivered' ? today : undefined)

    if (newStatus === 'delivered' && expense.delivery_status === 'ordered' && expense.quantity && expense.quantity > 0) {
      const existing = stock.find(s => s.material_name === expense.category)
      if (existing) {
        await upsertMaterialStock(supabase, activeProject.id, expense.category, {
          on_hand_qty: existing.on_hand_qty + expense.quantity,
        })
      }
    }

    setUpdatingDelivery(null)
    await loadData()
  }

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
        <Skeleton className="h-12 rounded-lg" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-3">

      {/* ── Summary pills ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {categoryRows.length} material{categoryRows.length !== 1 ? 's' : ''} tracked
        </span>
        {inTransitCount > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {inTransitCount} order{inTransitCount !== 1 ? 's' : ''} in transit
          </span>
        )}
        {needsReorderCount > 0 && (
          <span className="rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-[11px] font-medium text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {needsReorderCount} need{needsReorderCount === 1 ? 's' : ''} reordering
          </span>
        )}
      </div>

      {/* ── Reorder alert banner ────────────────────────────────────────── */}
      {needsReorderCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Low stock: </span>
            {categoryRows.filter(r => r.needsReorder).map(r => r.name).join(' · ')}
            {' '}— on-hand quantity is below your reorder threshold.
          </span>
        </div>
      )}

      {/* ── In-transit alert ────────────────────────────────────────────── */}
      {inTransitCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <Truck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">{inTransitCount} order{inTransitCount !== 1 ? 's' : ''} not yet delivered. </span>
            Confirm arrival in the Orders tab to update your stock count.
          </span>
        </div>
      )}

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['stock', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all border ${
              activeTab === tab
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {tab === 'stock' ? 'Stock' : 'Orders'}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STOCK TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stock' && (
        <div className="space-y-2">
          {categoryRows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
              <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No material expenses logged yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add expenses with a material category (Cement, Steel, Bricks, etc.) in Cash Flow to see them here.
              </p>
            </div>
          ) : (
            categoryRows.map(row => (
              <StockCard
                key={row.name}
                row={row}
                editingStock={editingStock}
                editingThreshold={editingThreshold}
                editInputRef={editInputRef}
                onEditStock={() => setEditingStock({ name: row.name, qty: row.onHandQty?.toString() ?? '0', unit: row.unit })}
                onEditThreshold={() => setEditingThreshold({ name: row.name, threshold: row.reorderThreshold?.toString() ?? '' })}
                onSaveStock={(qty, unit) => saveOnHand(row.name, qty, unit)}
                onSaveThreshold={(t) => saveThreshold(row.name, t)}
                onCancelEdit={() => setEditingStock(null)}
                onCancelThreshold={() => setEditingThreshold(null)}
              />
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ORDERS TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {expenses.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">No material orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Supplier</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Ordered (in-transit) rows first */}
                  {[
                    ...expenses.filter(e => e.delivery_status === 'ordered'),
                    ...expenses.filter(e => e.delivery_status !== 'ordered'),
                  ].map(exp => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${exp.delivery_status === 'ordered' ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-muted/30'}`}
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {fmtDate(exp.date)}
                        {exp.expected_delivery_date && exp.delivery_status === 'ordered' && (
                          <span className="block text-[10px] text-amber-600">
                            Exp. {fmtDate(exp.expected_delivery_date)}
                          </span>
                        )}
                        {exp.confirmed_delivery_date && exp.delivery_status === 'delivered' && (
                          <span className="block text-[10px] text-emerald-600">
                            Arrived {fmtDate(exp.confirmed_delivery_date)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 max-w-[160px]">
                        <p className="font-medium text-foreground truncate">{exp.description}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.category}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[120px] truncate">
                        {exp.vendor ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {exp.quantity != null ? `${exp.quantity.toLocaleString()}${exp.unit ? ' ' + exp.unit : ''}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {exp.delivery_status === 'ordered' ? (
                          <button
                            onClick={() => confirmDelivery(exp)}
                            disabled={updatingDelivery === exp.id}
                            className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {updatingDelivery === exp.id ? '…' : '✓ Confirm'}
                          </button>
                        ) : (
                          <select
                            value={exp.delivery_status ?? 'delivered'}
                            disabled={updatingDelivery === exp.id}
                            onChange={e => changeDeliveryStatus(exp, e.target.value as 'ordered' | 'delivered' | 'consumed')}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-0 cursor-pointer appearance-none text-center ${deliveryBadgeClass(exp.delivery_status ?? 'delivered')} disabled:opacity-50`}
                          >
                            <option value="ordered">Ordered</option>
                            <option value="delivered">Delivered</option>
                            <option value="consumed">Consumed</option>
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-[11px] font-medium text-foreground whitespace-nowrap">
                        ${exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Stock counts are estimates. Update on-hand quantities after deliveries and consumption to keep alerts accurate.
      </p>
    </div>
  )
}

// ─── StockCard ────────────────────────────────────────────────────────────────

function StockCard({
  row,
  editingStock,
  editingThreshold,
  editInputRef,
  onEditStock,
  onEditThreshold,
  onSaveStock,
  onSaveThreshold,
  onCancelEdit,
  onCancelThreshold,
}: {
  row: CategoryRow
  editingStock: { name: string; qty: string; unit: string } | null
  editingThreshold: { name: string; threshold: string } | null
  editInputRef: React.RefObject<HTMLInputElement | null>
  onEditStock: () => void
  onEditThreshold: () => void
  onSaveStock: (qty: string, unit: string) => void
  onSaveThreshold: (threshold: string) => void
  onCancelEdit: () => void
  onCancelThreshold: () => void
}) {
  const isEditingThis = editingStock?.name === row.name
  const isEditingThisThreshold = editingThreshold?.name === row.name

  return (
    <div className={`rounded-xl border bg-card shadow-sm p-4 transition-colors ${
      row.needsReorder ? 'border-destructive/40' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{row.icon}</span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {row.txnCount} order{row.txnCount !== 1 ? 's' : ''}
              {row.lastVendor ? ` · ${row.lastVendor}` : ''}
              {row.lastDate ? ` · ${new Date(row.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {row.inTransitOrders.length > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
              <Truck className="h-2.5 w-2.5" />
              {row.inTransitOrders.length} in transit
            </span>
          )}
          {row.needsReorder && (
            <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              Low stock
            </span>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        {/* On-hand (editable) */}
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">On site</p>
          {isEditingThis ? (
            <div className="flex items-center gap-1">
              <input
                ref={editInputRef}
                type="number"
                defaultValue={editingStock!.qty}
                onKeyDown={e => {
                  if (e.key === 'Enter') onSaveStock((e.target as HTMLInputElement).value, editingStock!.unit)
                  if (e.key === 'Escape') onCancelEdit()
                }}
                className="w-full rounded border border-primary bg-background px-1.5 py-0.5 text-xs font-mono focus:outline-none"
              />
              <button
                onClick={() => onSaveStock(editInputRef.current?.value ?? editingStock!.qty, editingStock!.unit)}
                className="text-primary flex-shrink-0"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-serif text-base font-semibold text-foreground">
                {row.onHandQty !== null ? row.onHandQty.toLocaleString() : '—'}
              </span>
              {row.unit && <span className="text-[9px] text-muted-foreground">{row.unit}</span>}
              <button
                onClick={onEditStock}
                className="ml-auto text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit2 className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Total purchased */}
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">Purchased</p>
          <p className="font-serif text-base font-semibold text-foreground">
            {row.totalPurchasedQty > 0 ? row.totalPurchasedQty.toLocaleString() : '—'}
            {row.totalPurchasedQty > 0 && row.unit && <span className="text-[9px] text-muted-foreground font-sans ml-1">{row.unit}</span>}
          </p>
          {row.totalPurchasedQty === 0 && (
            <p className="text-[9px] text-muted-foreground">{new Intl.NumberFormat().format(row.totalSpent)} spent</p>
          )}
        </div>

        {/* Reorder threshold */}
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">Reorder at</p>
          {isEditingThisThreshold ? (
            <ThresholdInput
              defaultValue={editingThreshold!.threshold}
              onSave={onSaveThreshold}
              onCancel={onCancelThreshold}
            />
          ) : (
            <div className="flex items-center gap-1">
              <span className={`font-serif text-base font-semibold ${row.reorderThreshold !== null ? 'text-foreground' : 'text-muted-foreground'}`}>
                {row.reorderThreshold !== null ? `${row.reorderThreshold}${row.unit ? ' ' + row.unit : ''}` : 'Not set'}
              </span>
              <button
                onClick={onEditThreshold}
                className="ml-auto text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit2 className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ThresholdInput ───────────────────────────────────────────────────────────

function ThresholdInput({
  defaultValue,
  onSave,
  onCancel,
}: {
  defaultValue: string
  onSave: (value: string) => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref}
        type="number"
        defaultValue={defaultValue}
        placeholder="e.g. 20"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter') onSave((e.target as HTMLInputElement).value)
          if (e.key === 'Escape') onCancel()
        }}
        className="w-full rounded border border-primary bg-background px-1.5 py-0.5 text-xs font-mono focus:outline-none"
      />
      <button
        onClick={() => onSave(ref.current?.value ?? '')}
        className="text-primary flex-shrink-0"
      >
        <Check className="h-3 w-3" />
      </button>
    </div>
  )
}
