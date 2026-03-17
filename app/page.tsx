import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/hiw-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { FeaturesGridSection } from "@/components/landing/features-grid";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <LandingHeader />
      <main className="flex-1">
        <div className="bg-[#EAE0D7]">
          <HeroSection />
        </div>
        <div className="bg-white">
          <HowItWorksSection />
        </div>
        <div className="bg-[#EAE0D7]">
          <FeaturesGridSection />
        </div>
        <div className="bg-white">
          <PricingSection />
        </div>
        <div className="bg-[#EAE0D7]">
          <FaqSection />
        </div>
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}