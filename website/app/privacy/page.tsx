import Link from "next/link";
import type { Metadata } from "next";

import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy — Alinnia",
  description: "Alinnia's Privacy Policy explaining how your data is collected, used, and protected.",
};

export default function PrivacyPolicyPage() {
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
              Legal & Privacy
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-black/50 dark:text-white/50">
              Effective Date: August 27, 2026 · Last Updated: August 27, 2026
            </p>
          </div>

          <section className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
            <p>
              Welcome to <strong>Alinnia</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are deeply committed to protecting your personal privacy and the confidentiality of your household dietary data. This Privacy Policy explains how our mobile application and related services collect, use, disclose, and safeguard your information.
            </p>
            <p>
              By accessing or using the Alinnia mobile application or website, you agree to the collection and use of your information in accordance with this policy.
            </p>
          </section>

          <hr className="border-black/10 dark:border-white/10" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">1. Information We Collect</h2>
            <p className="text-black/80 dark:text-white/80">
              We collect information you provide directly to us to personalize meal suggestions, calculate nutrition, and provide accurate grocery estimations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>Account & Authentication Information:</strong> When you register or sign in, we collect your email address and authentication credentials securely managed through Supabase.
              </li>
              <li>
                <strong>Household & Dietary Preferences:</strong> Household size (adults, children), selected cuisines (Pakistani, Middle Eastern, Mediterranean, etc.), spice level preferences, cooking habits, and dietary flags (e.g., diabetic-friendly, high protein, vegetarian, allergies, low-GI requirements).
              </li>
              <li>
                <strong>Meal Planning & Interaction Logs:</strong> Dishes approved or rejected in Dish Decider, weekly dinner schedules, custom meals, notes, and grocery checklist items.
              </li>
              <li>
                <strong>Diagnostic & Technical Data:</strong> Non-identifying device information, operating system version, and anonymous crash diagnostics to help us improve app performance.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">2. How We Use Your Information</h2>
            <p className="text-black/80 dark:text-white/80">We process your data strictly to deliver and improve our core services:</p>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>To generate personalized, culturally tailored dinner suggestions and weekly meal plans.</li>
              <li>To scale ingredient quantities and calculate accurate grocery shopping lists.</li>
              <li>To compute estimated grocery costs and nutritional breakdowns per serving.</li>
              <li>To synchronize your preferences, pantry items, and saved meal plans across your devices.</li>
              <li>To process subscription statuses and verify in-app purchases.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">3. Data Sharing & Third Parties</h2>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-800 dark:text-emerald-300">
              <strong>Our Privacy Pledge:</strong> We do <strong>NOT</strong> sell, rent, trade, or monetize your personal health, dietary, or profile data to any third-party advertisers or data brokers.
            </div>
            <p className="text-black/80 dark:text-white/80">
              We only share data with essential cloud infrastructure providers required to operate the service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>Supabase (PostgreSQL Cloud):</strong> Encrypted database hosting and secure user authentication.
              </li>
              <li>
                <strong>Apple App Store & Google Play:</strong> Secure payment processing and subscription billing management.
              </li>
              <li>
                <strong>Expo / EAS:</strong> Over-the-air app updates and crash reporting.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">4. Data Retention & Account Deletion</h2>
            <p className="text-black/80 dark:text-white/80">
              You retain full control over your personal data at all times:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-black/80 dark:text-white/80">
              <li>
                <strong>In-App Account Deletion:</strong> You can permanently delete your account, household members, meal history, and all stored data directly inside the app at any time by navigating to <strong>Household / Settings ➔ Delete Account</strong>.
              </li>
              <li>
                <strong>Permanent Removal:</strong> Once deleted, your account and all associated records are permanently erased from our production databases.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">5. Children&apos;s Privacy</h2>
            <p className="text-black/80 dark:text-white/80">
              Alinnia is intended for general audiences and household meal planners aged <strong>13 and older</strong>. We do not knowingly collect personal identifiable information directly from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately and we will promptly remove it.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">6. Security</h2>
            <p className="text-black/80 dark:text-white/80">
              We implement industry-standard administrative, technical, and physical security measures (including TLS encryption in transit and Row Level Security on database storage) to protect your personal information against unauthorized access, loss, or alteration.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">7. Changes to This Privacy Policy</h2>
            <p className="text-black/80 dark:text-white/80">
              We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Continued use of the app after such updates constitutes your acceptance of the modified policy.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">8. Contact Us</h2>
            <p className="text-black/80 dark:text-white/80">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out to us at:
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

