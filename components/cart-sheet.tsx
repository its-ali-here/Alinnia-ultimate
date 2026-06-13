"use client"

import Link from "next/link"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"

import { useCart } from "@/contexts/cart-context"
import { formatPriceFromCents } from "@/lib/products"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

export function CartSheet() {
  const { isOpen, closeCart, toggleCart, details, itemCount, subtotalCents, savingsCents, updateQuantity, removeItem } =
    useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? toggleCart() : closeCart())}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">
            Your cart {itemCount > 0 && `(${itemCount})`}
          </SheetTitle>
        </SheetHeader>

        {details.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/shop">Shop refills</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-4">
                {details.map((line) => (
                  <li key={line.key} className="flex gap-4 border-b border-border pb-4">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${line.product.bgClassName}`}
                    >
                      <line.product.icon className={`h-7 w-7 ${line.product.iconClassName}`} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium leading-tight">{line.product.name}</p>
                          {line.variant.name !== line.product.name && (
                            <p className="text-sm text-muted-foreground">{line.variant.name}</p>
                          )}
                          {line.isSubscription && (
                            <span className="mt-1 inline-flex rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-primary">
                              Subscribe & Save
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(line.key)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Remove ${line.product.name} from cart`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border">
                          <button
                            onClick={() => updateQuantity(line.key, line.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-sm">{line.quantity}</span>
                          <button
                            onClick={() => updateQuantity(line.key, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-medium">{formatPriceFromCents(line.lineTotalCents)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="flex-col gap-3 sm:flex-col">
              {savingsCents > 0 && (
                <div className="flex w-full items-center justify-between text-sm text-primary">
                  <span>Subscription savings</span>
                  <span>-{formatPriceFromCents(savingsCents)}</span>
                </div>
              )}
              <div className="flex w-full items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formatPriceFromCents(subtotalCents)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
