import Link from "next/link"
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/products"

const shopLinks: { label: string; category?: ProductCategory }[] = [
  { label: "All products" },
  { label: CATEGORY_LABELS["starter-kit"], category: "starter-kit" },
  { label: "Refill Tablets", category: "cleaning-tablet" },
  { label: CATEGORY_LABELS["dish-soap"], category: "dish-soap" },
  { label: CATEGORY_LABELS["hand-soap"], category: "hand-soap" },
  { label: CATEGORY_LABELS["laundry"], category: "laundry" },
  { label: CATEGORY_LABELS["accessory"], category: "accessory" },
]

const companyLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Our mission", href: "/#mission" },
  { label: "Join the waitlist", href: "/#waitlist" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:py-16">
        <div className="space-y-3">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">
            Alinnia
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Refillable cleaning, made for Pakistan. Less plastic, less waste, same spotless clean.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Shop</p>
          <ul className="space-y-2">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.category ? `/shop?category=${link.category}` : "/shop"}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Company</p>
          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Alinnia. All rights reserved.</p>
          <p>Made in Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  )
}
