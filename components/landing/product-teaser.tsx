import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRODUCTS, formatPriceFromCents } from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductTeaser() {
  const featured = PRODUCTS.slice(0, 6)

  return (
    <section id="shop" className="bg-muted">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            The lineup
          </h2>
          <p className="mt-3 text-muted-foreground">
            A small set of essentials, designed to refill forever.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <Link key={product.slug} href={`/shop/${product.slug}`} className="group">
              <Card className="h-full overflow-hidden border-none transition-shadow group-hover:shadow-md">
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

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/shop">Shop all products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
