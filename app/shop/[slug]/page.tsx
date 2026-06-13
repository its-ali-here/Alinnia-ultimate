"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Minus, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CATEGORY_LABELS,
  formatPriceFromCents,
  getProductBySlug,
  getSubscribePriceCents,
} from "@/lib/products"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const product = getProductBySlug(params.slug)
  const { addItem } = useCart()

  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? "")
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscribe">("one-time")
  const [quantity, setQuantity] = useState(1)

  const variant = useMemo(
    () => product?.variants.find((item) => item.id === variantId),
    [product, variantId]
  )

  if (!product || !variant) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-3xl font-semibold">Product not found</h1>
          <Button asChild>
            <Link href="/shop">Back to shop</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const subscribePrice = getSubscribePriceCents(product, variant.priceCents)
  const isSubscription = purchaseType === "subscribe" && product.subscribeDiscount > 0
  const unitPrice = isSubscription ? subscribePrice : variant.priceCents

  const handleAddToCart = () => {
    addItem(product.slug, variant.id, quantity, isSubscription)
    toast.success(`Added ${product.name} to cart`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>

          <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-3xl",
                product.bgClassName
              )}
            >
              <product.icon className={cn("h-24 w-24", product.iconClassName)} />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="secondary">{CATEGORY_LABELS[product.category]}</Badge>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.tagline}</p>
              </div>

              <p className="text-2xl font-semibold">{formatPriceFromCents(unitPrice)}</p>

              {product.variants.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Scent</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setVariantId(item.id)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          item.id === variantId
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.subscribeDiscount > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Purchase type</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setPurchaseType("one-time")}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        purchaseType === "one-time"
                          ? "border-primary bg-card"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <p className="font-medium text-foreground">One-time purchase</p>
                      <p className="mt-1 text-sm">{formatPriceFromCents(variant.priceCents)}</p>
                    </button>
                    <button
                      onClick={() => setPurchaseType("subscribe")}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        purchaseType === "subscribe"
                          ? "border-primary bg-card"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <RefreshCw className="h-4 w-4" />
                        Subscribe & Save
                      </div>
                      <p className="mt-1 text-sm">
                        {formatPriceFromCents(subscribePrice)}{" "}
                        <span className="text-primary">
                          ({Math.round(product.subscribeDiscount * 100)}% off, delivered every 2 months)
                        </span>
                      </p>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  Add to cart — {formatPriceFromCents(unitPrice * quantity)}
                </Button>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
