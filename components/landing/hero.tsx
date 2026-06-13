import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"

export function Hero() {
  return (
    <section className="container py-6 md:py-10">
      <div className="grid overflow-hidden rounded-[2.5rem] bg-secondary md:grid-cols-2 md:items-center">
        <div className="space-y-6 p-8 md:p-16">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Now shipping in Pakistan
          </span>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Clean your home.
            <br />
            Skip the plastic.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Alinnia makes refillable cleaning simple — get a forever bottle
            once, then reorder small concentrate tablets instead of shipping
            water (and plastic) across the country every time you run out.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/shop">Shop now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-background" asChild>
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>
        </div>

        <div className="relative flex aspect-square items-center justify-center bg-brand-light md:aspect-auto md:min-h-[28rem] md:self-stretch">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Droplets className="h-20 w-20" />
            <span className="text-sm font-medium text-foreground/70">
              Product photography coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
