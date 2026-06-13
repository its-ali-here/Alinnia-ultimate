import {
  Package,
  SprayCan,
  Droplets,
  Sparkles,
  HandHeart,
  Shirt,
  FlaskConical,
  type LucideIcon,
} from "lucide-react"

export type ProductCategory =
  | "cleaning-tablet"
  | "dish-soap"
  | "hand-soap"
  | "laundry"
  | "starter-kit"
  | "accessory"

export type ProductVariant = {
  id: string
  name: string
  sku: string
  priceCents: number
  stockQuantity: number
}

export type Product = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: ProductCategory
  priceCents: number
  isRefill: boolean
  icon: LucideIcon
  iconClassName: string
  bgClassName: string
  variants: ProductVariant[]
  /** Percentage discount applied when bought on a refill subscription, e.g. 0.15 = 15% off */
  subscribeDiscount: number
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "cleaning-tablet": "Surface Cleaner",
  "dish-soap": "Dish Soap",
  "hand-soap": "Hand Soap",
  laundry: "Laundry",
  "starter-kit": "Starter Kit",
  accessory: "Accessories",
}

export const PRODUCTS: Product[] = [
  {
    id: "starter-set",
    slug: "clean-home-starter-set",
    name: "Clean Home Starter Set",
    tagline: "Everything you need to go refillable",
    description:
      "Two forever bottles plus four concentrate tablets — Multi-Surface, Bathroom, Glass & Mirror, and Dish Soap. Drop a tablet in, fill with tap water, and you've got a full bottle of cleaner ready to go. The only thing you'll ever need to buy again is the tiny tablets.",
    category: "starter-kit",
    priceCents: 499900,
    isRefill: false,
    icon: Package,
    iconClassName: "text-category-starter-foreground",
    bgClassName: "bg-category-starter",
    subscribeDiscount: 0,
    variants: [
      { id: "starter-set-default", name: "Starter Set", sku: "ALN-START-01", priceCents: 499900, stockQuantity: 120 },
    ],
  },
  {
    id: "multi-surface-cleaner",
    slug: "multi-surface-cleaner",
    name: "Multi-Surface Cleaner",
    tagline: "One tablet, one full bottle, every surface",
    description:
      "Our everyday cleaner for countertops, tables, and everything in between. Drop the tablet into your forever bottle, fill with water, and shake — that's it. Tough on grime, gentle on the planet.",
    category: "cleaning-tablet",
    priceCents: 29900,
    isRefill: true,
    icon: SprayCan,
    iconClassName: "text-category-tablet-foreground",
    bgClassName: "bg-category-tablet",
    subscribeDiscount: 0.15,
    variants: [
      { id: "multi-surface-lavender", name: "Lavender", sku: "ALN-MSC-LAV", priceCents: 29900, stockQuantity: 400 },
      { id: "multi-surface-citrus", name: "Citrus Burst", sku: "ALN-MSC-CIT", priceCents: 29900, stockQuantity: 400 },
      { id: "multi-surface-unscented", name: "Unscented", sku: "ALN-MSC-UNS", priceCents: 29900, stockQuantity: 250 },
    ],
  },
  {
    id: "bathroom-cleaner",
    slug: "bathroom-cleaner",
    name: "Bathroom Cleaner",
    tagline: "Cuts soap scum without the harsh fumes",
    description:
      "A bathroom cleaner concentrate that tackles soap scum, water spots, and grime — without the overpowering chemical smell. Refreshing eucalyptus mint scent, zero plastic shipped.",
    category: "cleaning-tablet",
    priceCents: 29900,
    isRefill: true,
    icon: Sparkles,
    iconClassName: "text-category-tablet-foreground",
    bgClassName: "bg-category-tablet",
    subscribeDiscount: 0.15,
    variants: [
      { id: "bathroom-eucalyptus", name: "Eucalyptus Mint", sku: "ALN-BTH-EUC", priceCents: 29900, stockQuantity: 300 },
    ],
  },
  {
    id: "glass-cleaner",
    slug: "glass-and-mirror-cleaner",
    name: "Glass & Mirror Cleaner",
    tagline: "Streak-free shine, every time",
    description:
      "A streak-free formula for glass, mirrors, and windows. Lightweight, fast-drying, and ammonia-free — just the way a clean window should feel.",
    category: "cleaning-tablet",
    priceCents: 27900,
    isRefill: true,
    icon: Droplets,
    iconClassName: "text-category-tablet-foreground",
    bgClassName: "bg-category-tablet",
    subscribeDiscount: 0.15,
    variants: [
      { id: "glass-citrus", name: "Sparkling Citrus", sku: "ALN-GLS-CIT", priceCents: 27900, stockQuantity: 300 },
    ],
  },
  {
    id: "hand-soap-refill",
    slug: "hand-soap-refill",
    name: "Hand Soap Refill",
    tagline: "Gentle foaming hand soap, refill tablet",
    description:
      "A gentle, foaming hand soap that's tough on grime and easy on skin. One tablet refills a full foaming hand soap bottle — no jugs, no drips, no plastic.",
    category: "hand-soap",
    priceCents: 24900,
    isRefill: true,
    icon: HandHeart,
    iconClassName: "text-category-hand-foreground",
    bgClassName: "bg-category-hand",
    subscribeDiscount: 0.15,
    variants: [
      { id: "hand-soap-vanilla", name: "Vanilla Bean", sku: "ALN-HND-VAN", priceCents: 24900, stockQuantity: 350 },
      { id: "hand-soap-aloe", name: "Aloe & Cucumber", sku: "ALN-HND-ALO", priceCents: 24900, stockQuantity: 350 },
      { id: "hand-soap-citrus", name: "Citrus", sku: "ALN-HND-CIT", priceCents: 24900, stockQuantity: 250 },
    ],
  },
  {
    id: "dish-soap-refill",
    slug: "dish-soap-refill",
    name: "Dish Soap Refill",
    tagline: "Concentrate tablet for your dish soap bottle",
    description:
      "Cuts through grease without the harsh chemicals. One small tablet refills a full bottle of dish soap — same suds, same shine, a fraction of the plastic.",
    category: "dish-soap",
    priceCents: 24900,
    isRefill: true,
    icon: Droplets,
    iconClassName: "text-category-dish-foreground",
    bgClassName: "bg-category-dish",
    subscribeDiscount: 0.15,
    variants: [
      { id: "dish-soap-lemon", name: "Lemon", sku: "ALN-DSH-LEM", priceCents: 24900, stockQuantity: 400 },
    ],
  },
  {
    id: "laundry-concentrate",
    slug: "laundry-concentrate",
    name: "Laundry Concentrate",
    tagline: "One tablet, one full load — no jugs",
    description:
      "A laundry detergent concentrate that replaces the heavy plastic jug. One tablet per load, dissolves completely, and leaves clothes fresh — without shipping water across Pakistan.",
    category: "laundry",
    priceCents: 34900,
    isRefill: true,
    icon: Shirt,
    iconClassName: "text-category-laundry-foreground",
    bgClassName: "bg-category-laundry",
    subscribeDiscount: 0.15,
    variants: [
      { id: "laundry-fresh-linen", name: "Fresh Linen", sku: "ALN-LND-LIN", priceCents: 34900, stockQuantity: 300 },
    ],
  },
  {
    id: "forever-bottle",
    slug: "forever-bottle",
    name: "Forever Bottle",
    tagline: "A reusable bottle built to last",
    description:
      "A durable, refillable bottle designed to be filled again and again. Sturdy enough for daily use, with an ergonomic sprayer that won't quit.",
    category: "accessory",
    priceCents: 79900,
    isRefill: false,
    icon: FlaskConical,
    iconClassName: "text-category-accessory-foreground",
    bgClassName: "bg-category-accessory",
    subscribeDiscount: 0,
    variants: [
      { id: "forever-bottle-clear", name: "Clear", sku: "ALN-BTL-CLR", priceCents: 79900, stockQuantity: 200 },
      { id: "forever-bottle-frosted", name: "Frosted Mint", sku: "ALN-BTL-FRO", priceCents: 79900, stockQuantity: 200 },
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug)
}

export function getVariant(product: Product, variantId: string): ProductVariant | undefined {
  return product.variants.find((variant) => variant.id === variantId)
}

export function formatPriceFromCents(cents: number): string {
  const amount = cents / 100
  return `PKR ${amount.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function getSubscribePriceCents(product: Product, priceCents: number): number {
  return Math.round(priceCents * (1 - product.subscribeDiscount))
}
