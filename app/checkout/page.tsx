"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/contexts/cart-context"
import { formatPriceFromCents } from "@/lib/products"
import { cn } from "@/lib/utils"

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"]

const FREE_SHIPPING_THRESHOLD_CENTS = 300000
const SHIPPING_FEE_CENTS = 19900

export default function CheckoutPage() {
  const { details, itemCount, subtotalCents, savingsCents, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [orderPlaced, setOrderPlaced] = useState(false)

  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS || subtotalCents === 0 ? 0 : SHIPPING_FEE_CENTS
  const totalCents = subtotalCents + shippingCents

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOrderPlaced(true)
    clearCart()
  }

  if (orderPlaced) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-semibold">Order placed</h1>
          <p className="max-w-md text-muted-foreground">
            Thanks for choosing refillable. We've received your order and will be in touch with delivery details
            shortly.
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-3xl font-semibold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some refills before checking out.</p>
          <Button asChild size="lg">
            <Link href="/shop">Shop refills</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Checkout</h1>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" name="fullName" required placeholder="Ayesha Khan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="03XX XXXXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Shipping address</h2>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address line 1</Label>
                  <Input id="address1" name="address1" required placeholder="House no, street, area" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address line 2 (optional)</Label>
                  <Input id="address2" name="address2" placeholder="Apartment, floor, landmark" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required placeholder="Lahore" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select name="province" defaultValue={PROVINCES[0]}>
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 sm:max-w-xs">
                  <Label htmlFor="postalCode">Postal code (optional)</Label>
                  <Input id="postalCode" name="postalCode" placeholder="54000" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                      paymentMethod === "cod" ? "border-primary bg-card" : "border-border bg-card"
                    )}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                      paymentMethod === "card" ? "border-primary bg-card" : "border-border bg-card"
                    )}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay securely online. Card details requested next step.</p>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                      paymentMethod === "bank" ? "border-primary bg-card" : "border-border bg-card"
                    )}
                  >
                    <RadioGroupItem value="bank" id="bank" />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Transfer details will be emailed after checkout.</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">Order summary</h2>
                <ul className="mt-4 space-y-3">
                  {details.map((line) => (
                    <li key={line.key} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            line.product.bgClassName
                          )}
                        >
                          <line.product.icon className={cn("h-5 w-5", line.product.iconClassName)} />
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{line.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {line.variant.name !== line.product.name && `${line.variant.name} · `}
                            Qty {line.quantity}
                            {line.isSubscription && " · Subscription"}
                          </p>
                        </div>
                      </div>
                      <span className="whitespace-nowrap font-medium">{formatPriceFromCents(line.lineTotalCents)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {savingsCents > 0 && (
                    <div className="flex items-center justify-between text-primary">
                      <span>Subscription savings</span>
                      <span>-{formatPriceFromCents(savingsCents)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPriceFromCents(subtotalCents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCents === 0 ? "Free" : formatPriceFromCents(shippingCents)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPriceFromCents(totalCents)}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Place order
              </Button>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
