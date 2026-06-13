import { Package, FlaskConical, RefreshCw } from "lucide-react"

const steps = [
  {
    icon: Package,
    title: "1. Get your starter kit",
    description:
      "Order a set of reusable bottles plus your first concentrate tablets — everything you need to get started.",
  },
  {
    icon: FlaskConical,
    title: "2. Drop, fill, clean",
    description:
      "Drop a tablet into your bottle, fill with water, and you've got a full bottle of cleaner — same power, a fraction of the plastic.",
  },
  {
    icon: RefreshCw,
    title: "3. Reorder refills",
    description:
      "When you run low, reorder featherlight refill tablets. No more bottles of mostly-water shipped across Pakistan.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          How refills work
        </h2>
        <p className="mt-3 text-muted-foreground">
          One bottle. Endless refills. It's that simple.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-start gap-4 rounded-3xl bg-muted p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-primary">
              <step.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
