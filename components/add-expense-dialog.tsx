"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { Project, Phase } from "@/lib/project-queries"
import { upsertMaterialStock } from "@/lib/project-queries"

const CATEGORIES = [
  'Bricks', 'Cement', 'Steel', 'Sand', 'Crush',
  'Labour', 'Plumbing', 'Electrical', 'Waterproofing',
  'Materials', 'Miscellaneous', 'Other',
]

const MATERIAL_CATEGORIES = new Set([
  'Bricks', 'Cement', 'Steel', 'Sand', 'Crush',
  'Plumbing', 'Electrical', 'Waterproofing', 'Materials',
])

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Credit']

interface Props {
  project: Project
  phases: Phase[]
  previousVendors: string[]
  onSaved: () => void
  trigger: React.ReactNode
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  quantity: '',
  unit_rate: '',
  unit: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Cement',
  phase_id: '',
  vendor: '',
  notes: '',
  payment_method: 'Cash',
  paid_by: 'Self',
  paid_by_custom: '',
  delivery_status: 'delivered',
  expected_delivery_date: '',
}

export function AddExpenseDialog({ project, phases, previousVendors, onSaved, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showCustomPaidBy, setShowCustomPaidBy] = useState(false)

  // Auto-calc amount from qty × rate
  useEffect(() => {
    const qty = parseFloat(form.quantity)
    const rate = parseFloat(form.unit_rate)
    if (!isNaN(qty) && !isNaN(rate) && qty > 0 && rate > 0) {
      setForm(f => ({ ...f, amount: (qty * rate).toFixed(2) }))
    }
  }, [form.quantity, form.unit_rate])

  const set = (key: keyof typeof EMPTY_FORM, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handlePaidByChange = (val: string) => {
    if (val === 'Other') {
      setShowCustomPaidBy(true)
      set('paid_by', 'Other')
    } else {
      setShowCustomPaidBy(false)
      set('paid_by', val)
      set('paid_by_custom', '')
    }
  }

  const handleSubmit = async () => {
    if (!form.description || !form.amount) return
    setSubmitting(true)
    const supabase = createSupabaseBrowserClient()

    const isMaterial = MATERIAL_CATEGORIES.has(form.category)

    const payload: Record<string, unknown> = {
      project_id: project.id,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      vendor: form.vendor || null,
      phase_id: form.phase_id || null,
      notes: form.notes || null,
      payment_method: form.payment_method || null,
      paid_by: showCustomPaidBy ? (form.paid_by_custom || null) : (form.paid_by || null),
    }

    if (form.quantity) payload.quantity = parseFloat(form.quantity)
    if (form.unit_rate) payload.unit_rate = parseFloat(form.unit_rate)
    if (form.unit) payload.unit = form.unit

    if (isMaterial) {
      payload.delivery_status = form.delivery_status
      if (form.delivery_status === 'ordered' && form.expected_delivery_date) {
        payload.expected_delivery_date = form.expected_delivery_date
      }
    }

    await supabase.from('expenses').insert(payload)

    // When a material delivery is confirmed and has a quantity, increment on-hand stock
    if (isMaterial && form.delivery_status === 'delivered' && form.quantity) {
      const qty = parseFloat(form.quantity)
      if (qty > 0) {
        const { data: existing } = await supabase
          .from('material_stock')
          .select('on_hand_qty')
          .eq('project_id', project.id)
          .eq('material_name', form.category)
          .maybeSingle()
        if (existing) {
          await upsertMaterialStock(supabase, project.id, form.category, {
            unit: form.unit || existing.unit || '',
            on_hand_qty: (existing.on_hand_qty ?? 0) + qty,
          })
        }
      }
    }

    setForm(EMPTY_FORM)
    setShowCustomPaidBy(false)
    setSubmitting(false)
    setOpen(false)
    onSaved()
  }

  const selectClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Log an expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. Bestway cement delivery"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Phase + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phase</Label>
              <select value={form.phase_id} onChange={e => set('phase_id', e.target.value)} className={selectClass}>
                <option value="">No phase</option>
                {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Category <span className="text-destructive">*</span></Label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={selectClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Qty × Rate = Amount */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="e.g. 12000"
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit rate</Label>
              <Input
                type="number"
                placeholder="e.g. 18.6"
                value={form.unit_rate}
                onChange={e => set('unit_rate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input
                placeholder="bags, bricks…"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
              />
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
          </div>

          {/* Delivery status — material categories only */}
          {MATERIAL_CATEGORIES.has(form.category) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Delivery status</Label>
                <select
                  value={form.delivery_status}
                  onChange={e => set('delivery_status', e.target.value)}
                  className={selectClass}
                >
                  <option value="delivered">Delivered — on site</option>
                  <option value="ordered">Ordered — not arrived yet</option>
                </select>
              </div>
              {form.delivery_status === 'ordered' && (
                <div className="space-y-1.5">
                  <Label>Expected delivery</Label>
                  <Input
                    type="date"
                    value={form.expected_delivery_date}
                    onChange={e => set('expected_delivery_date', e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Supplier */}
          <div className="space-y-1.5">
            <Label>Supplier / Payee</Label>
            <Input
              list="vendor-suggestions"
              placeholder="e.g. Al-Fateh Enterprises"
              value={form.vendor}
              onChange={e => set('vendor', e.target.value)}
            />
            <datalist id="vendor-suggestions">
              {previousVendors.map(v => <option key={v} value={v} />)}
            </datalist>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes / Particulars</Label>
            <textarea
              placeholder="Grade, quantity, who paid, delivery details…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Payment method + Paid by */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} className={selectClass}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Paid by</Label>
              <select
                value={showCustomPaidBy ? 'Other' : form.paid_by}
                onChange={e => handlePaidByChange(e.target.value)}
                className={selectClass}
              >
                <option value="Self">Self</option>
                <option value="Funder">Funder</option>
                <option value="Contractor">Contractor</option>
                <option value="Other">Other…</option>
              </select>
            </div>
          </div>

          {showCustomPaidBy && (
            <div className="space-y-1.5">
              <Label>Who paid?</Label>
              <Input
                placeholder="e.g. Dada, Abu Jee…"
                value={form.paid_by_custom}
                onChange={e => set('paid_by_custom', e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !form.description || !form.amount}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {submitting ? 'Saving…' : 'Log expense'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
