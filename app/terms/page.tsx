import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Alinnia Studios",
  description: "Alinnia Studios Terms of Service governing website usage, early access, and alpha playtests.",
};

export default function TermsOfServicePage() {
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
              Legal Agreement
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-[#8493a8]">
              Effective Date: September 10, 2026 · Last Updated: September 10, 2026
            </p>
          </div>

          <section className="space-y-4 text-[#8493a8] leading-relaxed">
            <p>
              Welcome to <strong className="text-white">Alinnia Studios</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our website, pre-registration systems, and early playtest versions of our video games, including <strong>Everland</strong> (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing our website or registering for early playtest access, you agree to comply with and be bound by these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Early Access & Alpha Playtests</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              Playtest builds of <em>Everland</em> are confidential, work-in-progress software. They are provided on an &ldquo;as is&rdquo; basis for testing and feedback purposes. Features, assets, balance parameters, and server availability may change, be modified, or be reset without prior notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Intellectual Property Rights</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              All titles, code, artwork, game mechanics, trademarks, logos, lore, and visual assets associated with Alinnia Studios and <em>Everland</em> are the exclusive intellectual property of Alinnia Studios. You may not copy, reverse-engineer, decompile, redistribute, or create derivative works from our software without explicit written authorization.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Player Conduct & Fair Play</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#8493a8] leading-relaxed">
              <li>Players must respect fellow community members, playtesters, and developers across our public and private channels.</li>
              <li>Cheating, exploit abuse, automated botting, or intentional disruption of multiplayer game servers is strictly prohibited and grounds for permanent access revocation.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Disclaimer of Warranties</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              Our website and early access services are provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. Alinnia Studios does not guarantee uninterrupted or error-free operation of experimental game builds.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-white">5. Contact Information</h2>
            <p className="text-sm text-[#8493a8] leading-relaxed">
              If you have any questions concerning these Terms of Service, please reach out to:
            </p>
            <p className="font-mono text-sm text-[#00f0ff]">
              Email: <a href="mailto:legal@alinnia.com" className="hover:underline">legal@alinnia.com</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
