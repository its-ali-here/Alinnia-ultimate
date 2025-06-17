import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="container px-4 py-24 mx-auto lg:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Take Control of Your <span className="text-primary">Financial Future</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Manage your finances with confidence using our comprehensive dashboard. Track expenses, monitor investments,
          and achieve your financial goals with ease.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Smart Analytics</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get insights into your spending patterns</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Bank-Level Security</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your data is protected with enterprise security</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Real-time Updates</h3>
            <p className="mt-2 text-sm text-muted-foreground">Stay updated with live financial data</p>
          </div>
        </div>
      </div>
    </section>
  )
}
