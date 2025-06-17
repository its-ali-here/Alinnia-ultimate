import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="bg-primary/5 py-24">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to take control of your finances?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of users who have transformed their financial management with our comprehensive dashboard.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
