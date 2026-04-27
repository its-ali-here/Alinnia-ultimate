"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How it works', href: '#how-it-works' },
]

const resourceLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'Guides', href: '#' },
  { label: 'Support', href: '#' },
]

const companyLinks = [
  { label: 'About', href: '/extras/about' },
  { label: 'Privacy Policy', href: '/extras/privacy' },
  { label: 'Terms of Service', href: '/extras/terms' },
]

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-border bg-muted">
      <div className="container px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/headerlogo.png" alt="Alinnia" width={100} height={28} className="h-7 w-auto" />
            </Link>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>30 Lawrence Road, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>(+92) 303-0543000</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="https://wa.me/923458477010" target="_blank" className="text-muted-foreground transition-colors hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </Link>
              <Link href="https://instagram.com/alinniadotcom" target="_blank" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-[18px] w-[18px]" />
              </Link>
              <Link href="mailto:contact@alinnia.com" className="text-muted-foreground transition-colors hover:text-primary">
                <Mail className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alinnia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
