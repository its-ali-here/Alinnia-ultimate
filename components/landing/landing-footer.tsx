"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <Image src="/headerlogo.png" alt="Alinnia Logo" width={32} height={32} className="h-8 w-auto invert dark:invert-0"/>
              <span>Alinnia</span>
            </div>
            
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>30 Lawrence Road, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>(+92) 303-0543000</span>
              </div>
            </div>

            <div className="flex gap-4">
              {/* WhatsApp Link */}
              <Link href="https://wa.me/923458477010" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span className="sr-only">WhatsApp</span>
              </Link>
              {/* Instagram Link */}
              <Link href="https://instagram.com/alinniadotcom" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="size-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              {/* Mail Link */}
              <Link href="mailto:contact@alinnia.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="size-5" />
                <span className="sr-only">Mail</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center items-center text-center border-t border-border/40 pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Alinnia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}