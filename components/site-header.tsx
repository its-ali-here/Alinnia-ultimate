"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Our mission", href: "/#mission" },
]

export function SiteHeader() {
  const { itemCount, toggleCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground">
        Now shipping in Pakistan — Subscribe &amp; Save 15% on every refill
      </div>

      <header className="w-full border-b border-border bg-background">
        <div className="container grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <nav className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="justify-self-center text-2xl font-semibold tracking-tight text-primary">
            Alinnia
          </Link>

          <div className="flex items-center justify-end gap-2">
            <Button asChild size="sm" variant="ghost" className="hidden lg:inline-flex">
              <a href="/#waitlist">Join the waitlist</a>
            </Button>
            <button
              onClick={toggleCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-4 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/#waitlist"
              onClick={() => setMobileOpen(false)}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Join the waitlist
            </a>
          </nav>
        )}
      </header>
    </div>
  )
}
