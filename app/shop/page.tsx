"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, PRODUCTS, formatPriceFromCents, type ProductCategory } from "@/lib/products"
import { cn } from "@/lib/utils"

const FILTERS: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  ...(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([value, label]) => ({
    label,
    value,
  })),
]

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS))

function ShopContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const initialFilter = categoryParam && VALID_CATEGORIES.has(categoryParam) ? (categoryParam as ProductCategory) : "all"

  const [filter, setFilter] = useState<ProductCategory | "all">(initialFilter)

  const products = filter === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.category === filter)

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Shop</h1>
        <p className="mt-3 text-muted-foreground">
          Forever bottles and featherlight refill tablets. Buy once, or subscribe and save on every refill.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.slug} href={`/shop/${product.slug}`} className="group">
            <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
              <div className={cn("flex aspect-square items-center justify-center", product.bgClassName)}>
                <product.icon className={cn("h-12 w-12", product.iconClassName)} />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.isRefill && <Badge variant="secondary">Refill</Badge>}
                </div>
                <CardDescription>{product.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{formatPriceFromCents(product.priceCents)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense>
          <ShopContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
