import Link from "next/link"
import { Package, SprayCan, Droplets, HandHeart, Shirt, FlaskConical, type LucideIcon } from "lucide-react"
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/products"
import { cn } from "@/lib/utils"

const categories: {
  value: ProductCategory
  icon: LucideIcon
  bgClassName: string
  iconClassName: string
}[] = [
  { value: "starter-kit", icon: Package, bgClassName: "bg-category-starter", iconClassName: "text-category-starter-foreground" },
  { value: "cleaning-tablet", icon: SprayCan, bgClassName: "bg-category-tablet", iconClassName: "text-category-tablet-foreground" },
  { value: "dish-soap", icon: Droplets, bgClassName: "bg-category-dish", iconClassName: "text-category-dish-foreground" },
  { value: "hand-soap", icon: HandHeart, bgClassName: "bg-category-hand", iconClassName: "text-category-hand-foreground" },
  { value: "laundry", icon: Shirt, bgClassName: "bg-category-laundry", iconClassName: "text-category-laundry-foreground" },
  { value: "accessory", icon: FlaskConical, bgClassName: "bg-category-accessory", iconClassName: "text-category-accessory-foreground" },
]

export function ShopByCategory() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Shop by category
        </h2>
        <p className="mt-3 text-muted-foreground">
          Find your refill, fast.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.value}
            href={`/shop?category=${category.value}`}
            className="group flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-md"
          >
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", category.bgClassName)}>
              <category.icon className={cn("h-7 w-7", category.iconClassName)} />
            </div>
            <span className="text-sm font-medium">{CATEGORY_LABELS[category.value]}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
