import { Layers, PaintBucket, ChefHat, Bath, DoorOpen, Building2, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type MaterialVariant = {
  id: string
  label: string
  description: string
  fallbackPriceUSsqft: number
  fallbackPriceUKsqm: number
  priceSearchQuery: string
}

export type BudgetCategory = {
  id: string
  name: string
  icon: LucideIcon
  defaultVariantIndex: number
  variants: MaterialVariant[]
}

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: "flooring",
    name: "Flooring",
    icon: Layers,
    defaultVariantIndex: 1,
    variants: [
      { id: "vinyl-plank", label: "Vinyl Plank", description: "Waterproof LVT, easy underfoot, hides subfloor imperfections", fallbackPriceUSsqft: 2, fallbackPriceUKsqm: 18, priceSearchQuery: "vinyl plank flooring" },
      { id: "laminate", label: "Laminate", description: "Cost-effective wood-look finish, good scratch resistance", fallbackPriceUSsqft: 3, fallbackPriceUKsqm: 26, priceSearchQuery: "laminate flooring" },
      { id: "engineered-wood", label: "Engineered Wood", description: "Real wood surface on stable ply core, can be refinished once", fallbackPriceUSsqft: 7, fallbackPriceUKsqm: 63, priceSearchQuery: "engineered wood flooring" },
      { id: "solid-hardwood", label: "Solid Hardwood", description: "Full-depth timber, refinishable multiple times, premium feel", fallbackPriceUSsqft: 12, fallbackPriceUKsqm: 110, priceSearchQuery: "solid hardwood flooring" },
      { id: "porcelain-tile", label: "Porcelain Tile", description: "Durable, low maintenance, ideal for wet areas and kitchens", fallbackPriceUSsqft: 5, fallbackPriceUKsqm: 45, priceSearchQuery: "porcelain tile flooring" },
      { id: "marble", label: "Marble", description: "Natural stone with unique veining, high-end look, requires sealing", fallbackPriceUSsqft: 20, fallbackPriceUKsqm: 185, priceSearchQuery: "marble tile flooring" },
    ],
  },
  {
    id: "walls",
    name: "Walls & Paint",
    icon: PaintBucket,
    defaultVariantIndex: 1,
    variants: [
      { id: "emulsion", label: "Emulsion", description: "Standard 2-coat emulsion, clean and practical", fallbackPriceUSsqft: 1, fallbackPriceUKsqm: 8, priceSearchQuery: "emulsion paint" },
      { id: "premium-paint", label: "Premium Paint + Skim", description: "High-hide formula over plaster skim coat, superior finish", fallbackPriceUSsqft: 2.5, fallbackPriceUKsqm: 22, priceSearchQuery: "premium paint plaster" },
      { id: "venetian-plaster", label: "Venetian Plaster", description: "Polished lime plaster with depth and texture, timeless feel", fallbackPriceUSsqft: 6, fallbackPriceUKsqm: 55, priceSearchQuery: "venetian plaster" },
      { id: "wallpaper", label: "Wallpaper", description: "Designer or paste-the-wall wallcovering, bold or subtle patterns", fallbackPriceUSsqft: 8, fallbackPriceUKsqm: 72, priceSearchQuery: "wallpaper installation" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
    defaultVariantIndex: 1,
    variants: [
      { id: "flatpack", label: "Flat-pack", description: "IKEA-style modular units with laminate worktop, DIY-friendly", fallbackPriceUSsqft: 60, fallbackPriceUKsqm: 550, priceSearchQuery: "flat pack kitchen cabinets" },
      { id: "semi-custom", label: "Semi-custom", description: "Rigid carcasses, stone worktop, better hardware and soft-close", fallbackPriceUSsqft: 150, fallbackPriceUKsqm: 1400, priceSearchQuery: "semi custom kitchen cabinets" },
      { id: "custom", label: "Custom", description: "Made-to-measure cabinetry, quartz surfaces, integrated appliances", fallbackPriceUSsqft: 300, fallbackPriceUKsqm: 2800, priceSearchQuery: "custom kitchen cabinetry" },
      { id: "bespoke", label: "Bespoke", description: "Hand-crafted joinery, statement island, luxury appliances throughout", fallbackPriceUSsqft: 600, fallbackPriceUKsqm: 5500, priceSearchQuery: "bespoke kitchen joinery" },
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    icon: Bath,
    defaultVariantIndex: 1,
    variants: [
      { id: "standard-suite", label: "Standard Suite", description: "Basic white sanitaryware, ceramic wall tiles, chrome fittings", fallbackPriceUSsqft: 80, fallbackPriceUKsqm: 750, priceSearchQuery: "standard bathroom suite" },
      { id: "contemporary-suite", label: "Contemporary Suite", description: "Contemporary sanitaryware, porcelain tiles, thermostatic shower", fallbackPriceUSsqft: 200, fallbackPriceUKsqm: 1900, priceSearchQuery: "mid range bathroom suite" },
      { id: "premium-suite", label: "Premium Suite", description: "Wet room or freestanding bath, quality fixtures, underfloor heating", fallbackPriceUSsqft: 400, fallbackPriceUKsqm: 3800, priceSearchQuery: "premium bathroom fixtures" },
    ],
  },
  {
    id: "windows",
    name: "Windows & Doors",
    icon: DoorOpen,
    defaultVariantIndex: 1,
    variants: [
      { id: "upvc", label: "uPVC Double-glazed", description: "Low maintenance, thermally efficient, most affordable option", fallbackPriceUSsqft: 15, fallbackPriceUKsqm: 140, priceSearchQuery: "upvc double glazed windows" },
      { id: "aluminium", label: "Aluminium Frames", description: "Slim sightlines, durable, powder-coated in any RAL colour", fallbackPriceUSsqft: 35, fallbackPriceUKsqm: 320, priceSearchQuery: "aluminium window frames" },
      { id: "wood-clad", label: "Wood-clad Triple-glazed", description: "Warm timber interior, high acoustic and thermal performance", fallbackPriceUSsqft: 70, fallbackPriceUKsqm: 650, priceSearchQuery: "wood clad triple glazed windows" },
      { id: "crittal", label: "Crittal-style Steel", description: "Industrial-chic steel frames, statement look, bespoke sizes", fallbackPriceUSsqft: 130, fallbackPriceUKsqm: 1200, priceSearchQuery: "crittal steel windows" },
    ],
  },
  {
    id: "mep",
    name: "MEP Services",
    icon: Zap,
    defaultVariantIndex: 1,
    variants: [
      { id: "mep-essentials", label: "Essentials", description: "Partial replumb/rewire, like-for-like replacement", fallbackPriceUSsqft: 8, fallbackPriceUKsqm: 75, priceSearchQuery: "" },
      { id: "mep-full-plumb", label: "Full Replumb", description: "New pipework throughout, partial rewire", fallbackPriceUSsqft: 18, fallbackPriceUKsqm: 170, priceSearchQuery: "" },
      { id: "mep-rewire-ufh", label: "Full Rewire + UFH", description: "Complete rewire, underfloor heating, consumer unit upgrade", fallbackPriceUSsqft: 32, fallbackPriceUKsqm: 295, priceSearchQuery: "" },
      { id: "mep-smart", label: "Smart Home Spec", description: "HVAC, smart controls, high-spec AV and lighting throughout", fallbackPriceUSsqft: 55, fallbackPriceUKsqm: 510, priceSearchQuery: "" },
    ],
  },
  {
    id: "structural",
    name: "Structural Work",
    icon: Building2,
    defaultVariantIndex: 1,
    variants: [
      { id: "struct-minor", label: "Minor Works", description: "Single wall removal, standard RSJ installation", fallbackPriceUSsqft: 5, fallbackPriceUKsqm: 46, priceSearchQuery: "" },
      { id: "struct-beams", label: "Multiple Beams", description: "Several structural beams, chimney breast removal", fallbackPriceUSsqft: 12, fallbackPriceUKsqm: 110, priceSearchQuery: "" },
      { id: "struct-load", label: "Load-bearing Restructure", description: "Major layout changes, underpinning, structural engineer required", fallbackPriceUSsqft: 25, fallbackPriceUKsqm: 230, priceSearchQuery: "" },
      { id: "struct-basement", label: "Basement Dig", description: "Full basement excavation, tanking, and fit-out", fallbackPriceUSsqft: 45, fallbackPriceUKsqm: 415, priceSearchQuery: "" },
    ],
  },
]
