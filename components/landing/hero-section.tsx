"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden bg-[#EAE0D7]">
            <div className="container px-4 md:px-6 relative">
                <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-4xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 text-black">
                        BUILD, BETTER.
                    </h1>
                    <p className="text-lg md:text-xl text-black mb-8 max-w-3xl mx-auto">
                        Alinnia is the all-in-one platform for construction professionals. Manage your projects, from bidding to closeout, with a single, easy-to-use solution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup"><Button size="lg" className="rounded-full h-12 px-8 text-base bg-[#FF5A13] text-black hover:bg-[#FF7A33]">Start Your Project <ArrowRight className="ml-2 size-4" /></Button></Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}