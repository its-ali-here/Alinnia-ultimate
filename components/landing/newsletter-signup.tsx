"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="container py-16 md:py-24">
      <div className="mx-auto max-w-xl rounded-[2.5rem] bg-accent p-8 text-center text-accent-foreground md:p-12">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Be first to refill
        </h2>
        <p className="mt-3 text-accent-foreground/70">
          Join the waitlist and we'll let you know the moment Alinnia launches in your city.
        </p>

        {submitted ? (
          <p className="mt-6 font-medium text-accent-foreground">
            Thanks! We'll be in touch when we launch.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-none bg-background"
            />
            <Button type="submit" size="lg" variant="default" className="bg-foreground text-background hover:bg-foreground/90 sm:w-auto">
              Notify me
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
