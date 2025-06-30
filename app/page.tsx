import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { TabbedShowcase } from "@/components/landing/tabbed-showcase";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LogosSection } from "@/components/landing/logos-section";
import { HowItWorksSection } from "@/components/landing/hiw-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <TabbedShowcase />
        <LogosSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  )
}