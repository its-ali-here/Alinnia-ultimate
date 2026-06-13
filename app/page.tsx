import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/landing/hero"
import { ShopByCategory } from "@/components/landing/shop-by-category"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ProductTeaser } from "@/components/landing/product-teaser"
import { Mission } from "@/components/landing/mission"
import { NewsletterSignup } from "@/components/landing/newsletter-signup"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ShopByCategory />
        <HowItWorks />
        <ProductTeaser />
        <Mission />
        <NewsletterSignup />
      </main>
      <SiteFooter />
    </div>
  )
}
