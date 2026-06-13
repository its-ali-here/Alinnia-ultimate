"use client"

import * as React from "react"
import {
  getProductBySlug,
  getSubscribePriceCents,
  getVariant,
  type Product,
  type ProductVariant,
} from "@/lib/products"

export type CartLine = {
  key: string
  productSlug: string
  variantId: string
  quantity: number
  isSubscription: boolean
}

export type CartLineDetails = CartLine & {
  product: Product
  variant: ProductVariant
  unitPriceCents: number
  basePriceCents: number
  lineTotalCents: number
}

type CartContextValue = {
  lines: CartLine[]
  details: CartLineDetails[]
  itemCount: number
  subtotalCents: number
  savingsCents: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (productSlug: string, variantId: string, quantity?: number, isSubscription?: boolean) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = "alinnia-cart"

function makeKey(productSlug: string, variantId: string, isSubscription: boolean) {
  return `${productSlug}:${variantId}:${isSubscription ? "sub" : "one"}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setLines(JSON.parse(stored))
      }
    } catch {
      // ignore malformed storage
    } finally {
      setHasLoaded(true)
    }
  }, [])

  React.useEffect(() => {
    if (!hasLoaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines, hasLoaded])

  const addItem = React.useCallback(
    (productSlug: string, variantId: string, quantity = 1, isSubscription = false) => {
      const key = makeKey(productSlug, variantId, isSubscription)
      setLines((current) => {
        const existing = current.find((line) => line.key === key)
        if (existing) {
          return current.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + quantity } : line
          )
        }
        return [...current, { key, productSlug, variantId, quantity, isSubscription }]
      })
      setIsOpen(true)
    },
    []
  )

  const updateQuantity = React.useCallback((key: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter((line) => line.key !== key)
      }
      return current.map((line) => (line.key === key ? { ...line, quantity } : line))
    })
  }, [])

  const removeItem = React.useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key))
  }, [])

  const clearCart = React.useCallback(() => setLines([]), [])

  const openCart = React.useCallback(() => setIsOpen(true), [])
  const closeCart = React.useCallback(() => setIsOpen(false), [])
  const toggleCart = React.useCallback(() => setIsOpen((value) => !value), [])

  const details = React.useMemo<CartLineDetails[]>(() => {
    return lines.flatMap((line) => {
      const product = getProductBySlug(line.productSlug)
      const variant = product ? getVariant(product, line.variantId) : undefined
      if (!product || !variant) return []
      const basePriceCents = variant.priceCents
      const unitPriceCents = line.isSubscription
        ? getSubscribePriceCents(product, variant.priceCents)
        : basePriceCents
      return [
        {
          ...line,
          product,
          variant,
          unitPriceCents,
          basePriceCents,
          lineTotalCents: unitPriceCents * line.quantity,
        },
      ]
    })
  }, [lines])

  const itemCount = React.useMemo(
    () => details.reduce((sum, line) => sum + line.quantity, 0),
    [details]
  )

  const subtotalCents = React.useMemo(
    () => details.reduce((sum, line) => sum + line.lineTotalCents, 0),
    [details]
  )

  const savingsCents = React.useMemo(
    () =>
      details.reduce(
        (sum, line) => sum + (line.basePriceCents - line.unitPriceCents) * line.quantity,
        0
      ),
    [details]
  )

  const value = React.useMemo<CartContextValue>(
    () => ({
      lines,
      details,
      itemCount,
      subtotalCents,
      savingsCents,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      lines,
      details,
      itemCount,
      subtotalCents,
      savingsCents,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
