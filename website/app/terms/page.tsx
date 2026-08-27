import Link from "next/link";
import type { Metadata } from "next";

import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service — Alinnia",
  description: "Alinnia's Terms of Service and End User Agreement.",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FBFAF2] text-[#042A1C] dark:bg-[#0A0F0D] dark:text-[#F4F7F5]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FBFAF2]/85 dark:bg-[#0A0F0D]/85 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-black/10 dark:border-white/15 shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/icon.png"
                alt="Alinnia App Icon"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#042A1C] dark:text-white">
              Alinnia
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[#14A85C] hover:text-[#0C8747] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
              Legal & Terms
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-sm text-black/50 dark:text-white/50">
              Effective Date: August 27, 2026 · Last Updated: August 27, 2026
            </p>
          </div>

          <section className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
            <p>
              Welcome to <strong>Alinnia</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your download, access, and use of the Alinnia mobile application and related web services (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              By creating an account, downloading, or using Alinnia, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <hr className="border-black/10 dark:border-white/10" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">1. Medical & Nutritional Disclaimer</h2>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">⚠️ Not Medical Advice</p>
              <p className="text-sm">
                Alinnia provides AI-assisted meal suggestions, recipe information, and nutritional estimations for general lifestyle and household planning purposes only. It does NOT constitute medical, dietary, or clinical advice.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>No Doctor-Patient Relationship:</strong> The information provided through Alinnia is not designed to diagnose, treat, cure, or prevent any medical condition or disease (including diabetes, hypertension, renal conditions, or severe food allergies).
              </li>
              <li>
                <strong>User Responsibility:</strong> Always seek the advice of your physician, certified dietitian, or qualified healthcare provider before undertaking significant dietary changes or if you have medical dietary requirements or pregnancy considerations.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">2. Eligibility & User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>Age Requirement:</strong> You must be at least <strong>13 years of age</strong> to use Alinnia. By using the Service, you represent that you meet this age requirement.
              </li>
              <li>
                <strong>Account Security:</strong> You are responsible for safeguarding your login credentials and for all activities that occur under your account. Notify us immediately if you suspect unauthorized account access.
              </li>
              <li>
                <strong>Account Deletion:</strong> You may terminate your account and delete your stored data at any time directly in the app via <strong>Household / Settings ➔ Delete Account</strong>.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">3. Grocery & Pricing Estimations</h2>
            <p className="text-black/80 dark:text-white/80">
              Price estimates, package sizing, and grocery costs displayed within the app (such as Foodpanda / local supermarket baseline estimates) are approximations provided for household budgeting purposes only. Actual market prices, brand availability, store taxes, and delivery fees may vary in real time.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">4. Subscriptions & In-App Purchases (&ldquo;Alinnia Plus&rdquo;)</h2>
            <p className="text-black/80 dark:text-white/80">
              Certain premium features (such as advanced diabetic guardrails, high-protein family portion auto-scaling, and live grocery price estimations) are offered under our paid subscription service, <strong>Alinnia Plus</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>Free Trials:</strong> If offered, your free trial (e.g., 3-day free trial) begins immediately upon confirming your subscription. Unless canceled at least 24 hours prior to the end of the trial period, your subscription will automatically convert into a paid recurring subscription.
              </li>
              <li>
                <strong>Billing & Payment:</strong> Payment will be charged to your Apple ID (App Store) or Google Play Account upon confirmation of purchase.
              </li>
              <li>
                <strong>Auto-Renewal:</strong> Subscriptions automatically renew at the selected billing interval (monthly or annually) unless auto-renew is turned off at least 24 hours before the end of the current billing cycle.
              </li>
              <li>
                <strong>Managing & Canceling:</strong> You can manage, modify, or cancel your subscription at any time by going to your device settings (iOS App Store Account Settings or Google Play Subscriptions).
              </li>
              <li>
                <strong>Refunds:</strong> All refund requests are subject to and processed exclusively through Apple&apos;s or Google&apos;s standard refund policies.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">5. Intellectual Property & Acceptable Use</h2>
            <p className="text-black/80 dark:text-white/80">
              All content, algorithms, UI designs, logos, and software code related to Alinnia are the exclusive property of Alinnia. You agree not to reverse engineer, copy, distribute, modify, or exploit any portion of the Service without prior written authorization.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">6. Limitation of Liability</h2>
            <p className="text-black/80 dark:text-white/80">
              To the maximum extent permitted by applicable law, Alinnia and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of (or inability to use) the Service, recipe errors, or ingredient allergic reactions.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">7. Governing Law & Dispute Resolution</h2>
            <p className="text-black/80 dark:text-white/80">
              These Terms shall be governed by and construed in accordance with the laws of <strong>Pakistan</strong>, without regard to its conflict of law principles. Any legal action or dispute arising out of these Terms shall be subject to the exclusive jurisdiction of the competent courts in Pakistan.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">8. Contact Us</h2>
            <p className="text-black/80 dark:text-white/80">
              If you have any questions or feedback regarding these Terms of Service, please contact:
            </p>
            <p className="text-black/90 dark:text-white/90">
              📧 Email:{" "}
              <a
                href="mailto:hello@alinnia.com"
                className="font-medium text-emerald-600 dark:text-emerald-400 underline underline-offset-4 hover:opacity-80"
              >
                hello@alinnia.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-4xl border-t border-black/10 px-6 py-8 text-center text-xs text-black/40 dark:border-white/10 dark:text-white/40">
        © {new Date().getFullYear()} Alinnia. All rights reserved.
      </footer>
    </div>
  );
}

