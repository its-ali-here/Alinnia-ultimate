"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
            <div className="container px-4 md:px-6 relative">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Elevate Your Workflow with{" "}
                        <span className="relative inline-block text-foreground">
                            <motion.span initial={{ fontWeight: 400 }} animate={{ fontWeight: 800 }} transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }} className="font-normal">Alinnia</motion.span>
                            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }} className="absolute bottom-[-8px] left-0 h-1.5 w-full origin-left bg-[hsl(var(--yellow))]" />
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        The all-in-one platform that helps teams collaborate, automate, and deliver exceptional results. Streamline your processes and focus on what matters most.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup"><Button size="lg" className="rounded-full h-12 px-8 text-base">Start Free Trial <ArrowRight className="ml-2 size-4" /></Button></Link>
                        <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">Book a Demo</Button>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Check className="size-4 text-primary" /><span>No credit card</span></div>
                        <div className="flex items-center gap-1"><Check className="size-4 text-primary" /><span>3-day trial</span></div>
                        <div className="flex items-center gap-1"><Check className="size-4 text-primary" /><span>Cancel anytime</span></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}