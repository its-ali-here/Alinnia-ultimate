"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export function FaqSection() {
  return (
    <section id="faq" className="w-full py-20 md:py-32 bg-[#EAE0D7]">
    <div className="container px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
      >
        <Badge className="rounded-full px-4 py-1.5 text-sm font-medium bg-[#FF5A13]/20 text-[#FF5A13]" variant="secondary">
          FAQ
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Frequently Asked Questions</h2>
        <p className="max-w-[800px] text-black md:text-lg">
          Find answers to common questions about Alinnia.
        </p>
      </motion.div>

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              question: "How long does it take to implement Alinnia?",
              answer:
                "Alinnia is designed for rapid deployment. Most of our customers are up and running in a matter of days, not weeks or months. Our dedicated onboarding team will work with you to ensure a smooth and successful implementation.",
            },
            {
              question: "What kind of support do you offer?",
              answer:
                "We offer a range of support options to meet your needs, including email, chat, and phone support. Our team of experts is available to help you get the most out of our platform.",
            },
            {
              question: "Is my data secure?",
              answer:
                "Yes, we take data security very seriously. We use the latest encryption and security technologies to protect your data. Our platform is hosted on a secure cloud infrastructure and we are fully compliant with all major data privacy regulations.",
            },
            {
              question: "Can I integrate Alinnia with my existing software?",
              answer:
                "Yes, we offer a range of integrations with popular construction software, including accounting, scheduling, and project management tools. We also have a robust API that allows you to build custom integrations.",
            },
            {
              question: "What makes Alinnia different from other construction software?",
              answer:
                "Alinnia is the only platform that offers a complete, end-to-end solution for construction project management. We are also committed to providing an exceptional user experience, with a focus on simplicity, ease of use, and mobile accessibility.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <AccordionItem value={`item-${i}`} className="border-b border-black/20 py-2">
                <AccordionTrigger className="text-left font-medium hover:no-underline text-black">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-black">{faq.answer}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </div>
    </section>
  );
}