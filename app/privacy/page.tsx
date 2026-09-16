import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Alinnia Studios",
  description: "Alinnia Studios Privacy Policy explaining data protection, playtest telemetry, and player privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#070a12] text-[#f1f5f9]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070a12]/85 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#0284c7] font-black text-[#070a12] text-lg shadow-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm text-white">ALINNIA STUDIOS</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[#00f0ff] hover:text-[#38bdf8] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="space-y-8">
          <div>
            <span className="inline-block rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-3 py-1 text-xs font-semibold text-[#00f0ff] mb-3">
              Player Privacy & Transparency
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-[#8493a8]">
              Effective Date: September 10, 2026 · Last Updated: September 10, 2026
            </p>
          </div>

          <section className="space-y-4 text-[#8493a8] leading-relaxed">
            <p>
              Welcome to <strong className="text-white">Alinnia Studios</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are an independent game studio developing interactive strategy titles, including our flagship game <strong>Everland</strong>. We are committed to protecting the privacy of our players, playtesters, and website visitors.
            </p>
            <p>
              This Privacy Policy details how we collect, store, process, and protect your information across our website, closed alpha/beta playtests, and game services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <div className="space-y-3 text-sm text-[#8493a8] leading-relaxed">
              <p>
                <strong className="text-white">Pre-Registration & Newsletter Data:</strong> When you register for the Everland Closed Alpha or sign up for our studio newsletter, we collect your email address and platform preferences (e.g. Steam, iOS, Android).
              </p>
              <p>
                <strong className="text-white">Alpha Playtest Telemetry:</strong> During closed alpha and beta playtest sessions, we may collect non-personal gameplay telemetry (such as crash logs, frame rate statistics, game session durations, balance metrics, and hardware configurations) strictly to optimize game performance and unit balance.
              </p>
              <p>
                <strong className="text-white">Website Cookies & Analytics:</strong> We use essential functional cookies and privacy-friendly analytics to understand website traffic and improve user experience.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#8493a8] leading-relaxed">
              <li>To deliver Everland Closed Alpha & Beta playtest keys to your registered email.</li>
              <li>To provide announcements, major patch notes, and community updates regarding Alinnia Studios titles.</li>
              <li>To diagnose technical crashes, improve server stability, and refine competitive gameplay balance.</li>
              <li>We <strong>never sell, rent, or trade</strong> your personal contact information to third-party advertisers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Data Security & Storage</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              We employ industry-standard encryption protocols (TLS/HTTPS) and secure database storage powered by certified cloud providers. Access to player data is restricted strictly to authorized studio developers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Your Rights & Opt-Out</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              You have the right to request access to, correction of, or deletion of your personal email address from our pre-registration records at any time. You may unsubscribe from communications by clicking the unsubscribe link in any email or by contacting our team.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-white">5. Contact Alinnia Studios</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              If you have any questions or concerns regarding our privacy practices or your playtest data, please contact us at:
            </p>
            <p className="font-mono text-sm text-[#00f0ff]">
              Email: <a href="mailto:privacy@alinnia.com" className="hover:underline">privacy@alinnia.com</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
