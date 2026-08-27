import WaitlistForm from "@/components/WaitlistForm";

const STEPS = [
  {
    title: "We track what your body needs",
    body: "Calories, protein, iron, vitamins — set once for the week, updated automatically as you cook.",
  },
  {
    title: "We suggest a dish you already know",
    body: "Pulled from your own cuisine, not a random \"healthy recipe\" you'll never actually cook.",
  },
  {
    title: "You get the exact shopping list",
    body: "Ingredients and quantities, scaled to how many people you're cooking for.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Alinnia</span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 text-center">
        <section className="flex flex-col items-center gap-6 pt-16 pb-20 sm:pt-24">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Know what your body needs.
            <br />
            Cook what your body craves.
          </h1>
          <p className="max-w-xl text-base text-black/60 dark:text-white/60 sm:text-lg">
            Alinnia sets your family&apos;s nutrition targets for the week, then suggests familiar dishes from
            your own cuisine to hit them — with a shopping list scaled to your household.
          </p>
          <div className="mt-2 flex flex-col items-center gap-3">
            <WaitlistForm />
            <p className="text-xs text-black/40 dark:text-white/40">
              Launching first on iOS and Android. No spam, just one email when we&apos;re live.
            </p>
          </div>
        </section>

        <section className="grid w-full grid-cols-1 gap-8 border-t border-black/10 py-16 text-left sm:grid-cols-3 dark:border-white/10">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <p className="text-sm text-black/60 dark:text-white/60">{step.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t border-black/10 px-6 py-8 text-xs text-black/50 sm:flex-row dark:border-white/10 dark:text-white/50">
        <div>
          © {new Date().getFullYear()} Alinnia. Not a substitute for professional medical or dietary advice.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-4"
          >
            Privacy Policy
          </a>
          <span>·</span>
          <a
            href="/terms"
            className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-4"
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
