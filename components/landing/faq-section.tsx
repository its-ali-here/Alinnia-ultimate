"use client"

import { motion } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Who is Alinnia built for?',
    a: 'Homeowners managing a renovation or new build, and small contractors who want to give clients a professional project view. No construction software experience needed.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Alinnia is a web app — it works in any browser on any device. Pull it up on your phone at the job site or on your laptop at home.',
  },
  {
    q: 'How does the 7-day free trial work?',
    a: 'Sign up and create your first project. Every feature is unlocked for 7 days. No credit card required to start.',
  },
  {
    q: 'Is my project data secure?',
    a: 'Yes. All data is encrypted in transit and at rest, hosted on enterprise-grade cloud infrastructure. Your project details are private and never shared.',
  },
  {
    q: 'Can I invite my contractor?',
    a: "Yes — you can share specific views (like the punch list or timeline) with your contractor without giving them access to your full financial data.",
  },
  {
    q: 'What countries does Alinnia support?',
    a: 'Alinnia works anywhere in the world. Currencies, date formats, and measurement units adapt to your preferences in settings.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="w-full bg-muted py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-primary">
            FAQ
          </span>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            Common questions
          </h2>
        </motion.div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem value={`faq-${i}`} className="border-b border-border py-1">
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
