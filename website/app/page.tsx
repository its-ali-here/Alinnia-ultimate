import Image from "next/image";
import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

const FEATURES = [
  {
    icon: "🍲",
    title: "Real Cultural Dishes, Not Boring Diets",
    desc: "No more bland salads or boiled chicken. Alinnia suggests authentic home-cooked meals from your own cuisine (Pakistani, Arab, South Asian, Mediterranean) that fulfill your exact nutrient gaps.",
    tag: "Authentic Food",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: "🎯",
    title: "Weekly Nutrient Gap Tracking",
    desc: "Set targets for protein, calories, iron, and key vitamins. As you approve meals during the week, Alinnia automatically tracks remaining gaps and suggests dinners to balance them.",
    tag: "Smart Nutrition",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "One Pot, Scaled for the Whole Family",
    desc: "Cooking for 2 adults and 3 kids? Alinnia automatically scales raw ingredient grams and spices for your exact household pot size, preventing food waste and overbuying.",
    tag: "Zero Waste",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    icon: "💪",
    title: "Gym Portions from the Shared Pot",
    desc: "Someone in the house lifting weights or hitting protein goals? The app calculates extra meat and protein portions directly from the family dish without cooking two separate meals.",
    tag: "Fitness Friendly",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  {
    icon: "🩸",
    title: "Diabetic & Health Guardrails",
    desc: "Automated low-GI substitutions, insulin carb guidance, and less-oil cooking tips for family members managing diabetes, cholesterol, or hypertension.",
    tag: "Health Focused",
    badgeColor: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  {
    icon: "🛒",
    title: "Live Grocery Cost Estimates",
    desc: "Real-time estimated ingredient costs and price per serving based on local supermarket & Foodpanda baselines. Know your weekly grocery bill before you shop.",
    tag: "Budget Smart",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Set Your Family's Health Profile",
    body: "Enter your household size, selected cuisines, spice tolerance, and dietary needs (diabetic-friendly, high protein, allergies).",
  },
  {
    num: "02",
    title: "Dish Decider Recommends Dinner",
    body: "Instead of asking 'What should we cook tonight?', get tailored dish suggestions. Approve in one tap, or reject with a reason (e.g., 'no meat tonight', 'too heavy').",
  },
  {
    num: "03",
    title: "Get Exact Ingredients & Grocery Cost",
    body: "See the exact ingredient breakdown scaled to your pot, complete with macronutrients, preparation guidance, and estimated grocery expenses.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#FBFAF2] text-[#042A1C] dark:bg-[#0A0F0D] dark:text-[#F4F7F5] selection:bg-[#14A85C] selection:text-white transition-colors duration-300">
      {/* ─── Top Navigation Header ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FBFAF2]/85 dark:bg-[#0A0F0D]/85 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-black/10 dark:border-white/15 shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/icon.png"
                alt="Alinnia App Icon"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight leading-none text-[#042A1C] dark:text-white">
                Alinnia
              </span>
              <span className="text-[11px] font-medium text-[#67796E] dark:text-[#9BB0A3] tracking-wide uppercase mt-0.5">
                Kitchen & Body
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#67796E] dark:text-[#9BB0A3]">
            <a href="#how-it-works" className="hover:text-[#14A85C] transition-colors">How It Works</a>
            <a href="#features" className="hover:text-[#14A85C] transition-colors">Features</a>
            <a href="#dish-decider" className="hover:text-[#14A85C] transition-colors">Dish Decider</a>
            <a href="#preview" className="hover:text-[#14A85C] transition-colors">App Preview</a>
          </nav>

          <a
            href="#waitlist"
            className="rounded-full bg-[#14A85C] hover:bg-[#0C8747] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-[#14A85C]/20 transition-all active:scale-95"
          >
            Get Early Access
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        {/* ─── Hero Section ─── */}
        <section className="relative w-full max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center flex flex-col items-center">
          {/* Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] rounded-full bg-[#14A85C]/10 blur-3xl pointer-events-none -z-10" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#14A85C]/25 bg-[#14A85C]/10 px-4 py-1.5 text-xs font-semibold text-[#0C8747] dark:text-[#8FE64B] mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#14A85C] animate-pulse" />
            The 1st AI Nutrition Planner for Real Cultural Food
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl text-[#042A1C] dark:text-white leading-[1.12]">
            Know what your body needs. <br />
            <span className="bg-gradient-to-r from-[#14A85C] to-[#8FE64B] bg-clip-text text-transparent">
              Cook what your family craves.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-[#67796E] dark:text-[#9BB0A3] leading-relaxed">
            Stop eating bland salads and separate diet meals. <strong>Alinnia</strong> tracks your weekly micronutrients, macros, and family targets—then suggests authentic, mouthwatering dishes from your own cuisine with automated portion scaling and grocery budgeting.
          </p>

          <div id="waitlist" className="mt-8 flex flex-col items-center gap-3 w-full">
            <WaitlistForm />
            <p className="text-xs text-[#67796E] dark:text-[#9BB0A3] flex items-center gap-2 mt-1">
              <span>🚀 Launching on iOS (App Store) & Android (Google Play)</span>
              <span>·</span>
              <span>🔒 100% Private, Zero Spam</span>
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl w-full text-xs font-medium text-[#042A1C] dark:text-[#F4F7F5]">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 dark:bg-[#141414] border border-black/5 dark:border-white/10 p-3 shadow-xs">
              <span>🇵🇰 🇦🇪 🇮🇳</span>
              <span>Pakistani & Arab Dishes</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 dark:bg-[#141414] border border-black/5 dark:border-white/10 p-3 shadow-xs">
              <span>🩸</span>
              <span>Diabetic Guardrails</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 dark:bg-[#141414] border border-black/5 dark:border-white/10 p-3 shadow-xs">
              <span>💪</span>
              <span>Gym High-Protein</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 dark:bg-[#141414] border border-black/5 dark:border-white/10 p-3 shadow-xs">
              <span>🛒</span>
              <span>Live PKR Grocery Costs</span>
            </div>
          </div>
        </section>

        {/* ─── Visual App Preview / Dish Decider Feature Card ─── */}
        <section id="dish-decider" className="w-full max-w-5xl px-6 py-12">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] p-6 sm:p-10 shadow-xl overflow-hidden relative">
            <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div className="flex-1 text-left space-y-4">
                <span className="inline-block rounded-full bg-[#FFC233]/20 px-3.5 py-1 text-xs font-bold text-[#D98C2B] dark:text-[#FFC233]">
                  🌟 Dish Decider Feature
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#042A1C] dark:text-white">
                  Never ask &ldquo;What should we make tonight?&rdquo; again.
                </h2>
                <p className="text-sm sm:text-base text-[#67796E] dark:text-[#9BB0A3] leading-relaxed">
                  Every evening, Alinnia calculates what nutrients your household is missing for the week and suggests a culturally authentic meal. Approve it in 1-tap, or reject with instant feedback to customize tomorrow.
                </p>
                <div className="space-y-2 pt-2 text-xs sm:text-sm text-[#042A1C] dark:text-[#F4F7F5]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#14A85C] font-bold">✓</span>
                    <span>Scales ingredients automatically for 1 to 10+ people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#14A85C] font-bold">✓</span>
                    <span>Tracks Carbs, Protein, Fat, Iron, and Vitamin gaps in real time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#14A85C] font-bold">✓</span>
                    <span>Live price estimates per serving & weekly grocery lists</span>
                  </div>
                </div>
              </div>

              {/* Mock App Card */}
              <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/15 bg-[#FBFAF2] dark:bg-[#1C2620] p-5 shadow-lg text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#14A85C]">
                    Tonight&apos;s Recommendation
                  </span>
                  <span className="rounded-md bg-[#14A85C]/15 px-2 py-0.5 text-[11px] font-semibold text-[#14A85C]">
                    High Protein · High Iron
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#042A1C] dark:text-white">
                  Chicken Karahi & Whole Wheat Roti
                </h3>
                <p className="text-xs text-[#67796E] dark:text-[#9BB0A3] mt-1">
                  Pakistani Home Cuisine · Medium Spice · Serves 4 (Family)
                </p>

                {/* Macro Badges */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="rounded-xl bg-white dark:bg-[#121A16] p-2.5 text-center border border-black/5 dark:border-white/10">
                    <span className="block text-xs font-semibold text-[#6B5FD1]">42g</span>
                    <span className="text-[10px] text-[#67796E] dark:text-[#9BB0A3]">Protein</span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#121A16] p-2.5 text-center border border-black/5 dark:border-white/10">
                    <span className="block text-xs font-semibold text-[#D98C2B]">38g</span>
                    <span className="text-[10px] text-[#67796E] dark:text-[#9BB0A3]">Carbs</span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#121A16] p-2.5 text-center border border-black/5 dark:border-white/10">
                    <span className="block text-xs font-semibold text-[#1F9E8E]">18g</span>
                    <span className="text-[10px] text-[#67796E] dark:text-[#9BB0A3]">Healthy Fat</span>
                  </div>
                </div>

                {/* Scaled ingredients preview */}
                <div className="rounded-xl bg-white dark:bg-[#121A16] p-3 text-xs space-y-1.5 border border-black/5 dark:border-white/10 mb-4">
                  <div className="flex justify-between font-medium">
                    <span>🛒 Scaled for 4 people:</span>
                    <span className="text-[#14A85C] font-semibold">~Rs 1,250 PKR</span>
                  </div>
                  <div className="text-[11px] text-[#67796E] dark:text-[#9BB0A3]">
                    • 800g Chicken breast & thigh <br />
                    • 4 fresh tomatoes, ginger, green chilies <br />
                    • 4 whole wheat handmade rotis
                  </div>
                </div>

                {/* Action Buttons Mock */}
                <div className="flex gap-2">
                  <button className="flex-1 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 py-2.5 text-xs font-semibold text-[#F0563E] transition">
                    ✕ Reject (Pick reason)
                  </button>
                  <button className="flex-1 rounded-xl bg-[#14A85C] hover:bg-[#0C8747] py-2.5 text-xs font-semibold text-white shadow-xs transition">
                    ✓ Approve Meal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works (3 Steps) ─── */}
        <section id="how-it-works" className="w-full max-w-5xl px-6 py-16 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14A85C]">
              Simple & Effortless
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#042A1C] dark:text-white mt-1">
              How Alinnia Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex flex-col gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] p-6 shadow-sm hover:border-[#14A85C]/40 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14A85C]/15 font-bold text-sm text-[#14A85C]">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-[#042A1C] dark:text-white">{step.title}</h3>
                <p className="text-sm text-[#67796E] dark:text-[#9BB0A3] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Key Feature Grid ─── */}
        <section id="features" className="w-full max-w-5xl px-6 py-16 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14A85C]">
              Comprehensive Household Nutrition
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#042A1C] dark:text-white mt-1">
              Built for real family kitchens
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{f.icon}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#042A1C] dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[#67796E] dark:text-[#9BB0A3] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Alinnia Plus Banner ─── */}
        <section className="w-full max-w-5xl px-6 py-10">
          <div className="rounded-3xl bg-gradient-to-br from-[#042A1C] to-[#0C4E34] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden text-left">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFC233] px-3.5 py-1 text-xs font-extrabold text-[#042A1C]">
                ★ ALINNIA PLUS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Unlock Complete Family Health Automation
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Upgrade to Alinnia Plus for diabetic low-GI carb guardrails, automated gym portion scaling, live Foodpanda grocery price estimation, and unlimited AI pantry matching.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#waitlist"
                  className="rounded-full bg-[#FFC233] hover:bg-[#F0C244] text-[#042A1C] font-bold text-sm px-7 py-3 shadow-lg transition active:scale-95"
                >
                  Join Waitlist for 3 Days Free Trial
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="w-full max-w-4xl px-6 py-16 text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#042A1C] dark:text-white">
            Take the stress out of dinner planning.
          </h2>
          <p className="mt-3 max-w-lg text-sm sm:text-base text-[#67796E] dark:text-[#9BB0A3]">
            Be the first to experience the smarter, tastier way to feed your family healthy cultural meals.
          </p>
          <div className="mt-6 w-full flex justify-center">
            <WaitlistForm />
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full border-t border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#070A09]/50 py-10 px-6 text-xs text-[#67796E] dark:text-[#9BB0A3]">
        <div className="mx-auto flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Alinnia Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-bold text-sm text-[#042A1C] dark:text-white">Alinnia</span>
            <span>— Kitchen & Body Nutrition</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-[#14A85C] transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#14A85C] transition-colors underline underline-offset-4">
              Terms of Service
            </Link>
            <a href="mailto:hello@alinnia.com" className="hover:text-[#14A85C] transition-colors">
              Support (hello@alinnia.com)
            </a>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl text-center text-[11px] text-[#67796E]/80 dark:text-[#9BB0A3]/80 border-t border-black/5 dark:border-white/5 pt-4">
          © {new Date().getFullYear()} Alinnia. Not medical advice. All nutrition estimations are for household planning purposes.
        </div>
      </footer>
    </div>
  );
}
