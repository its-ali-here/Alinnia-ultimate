"use client"

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Bot, Briefcase, MessagesSquare } from 'lucide-react';

export function TabbedShowcase() {
    return (
        <section id="features" className="w-full py-12 md:py-20">
            <div className="container px-4 md:px-6">
                <Tabs defaultValue="analytics" className="w-full">
                    <div className="flex justify-center">
                        <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1">
                            <TabsTrigger value="analytics" className="text-base py-2"><BarChart2 className="mr-2 h-5 w-5" />Analytics</TabsTrigger>
                            <TabsTrigger value="ai" className="text-base py-2"><Bot className="mr-2 h-5 w-5" />Alinnia AI</TabsTrigger>
                            <TabsTrigger value="projects" className="text-base py-2"><Briefcase className="mr-2 h-5 w-5" />Projects</TabsTrigger>
                            <TabsTrigger value="chat" className="text-base py-2"><MessagesSquare className="mr-2 h-5 w-5" />Chat</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="pt-12">
                        <TabsContent value="analytics">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <div className="space-y-4 text-center">
                                    <h2 className="text-3xl font-bold tracking-tight">Powerful, customizable analytics</h2>
                                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Turn your raw data into actionable insights. Create custom dashboards with charts and summary cards to monitor your business health at a glance.</p>
                                    <div className="mt-6 rounded-xl overflow-hidden border border-border/40 shadow-lg max-w-4xl mx-auto">
                                        <Image src="https://cdn.dribbble.com/userupload/12302729/file/original-fa372845e394ee85bebe0389b9d86871.png?resize=1504x1128&vertical=center" width={1280} height={720} alt="Analytics Dashboard" className="w-full h-auto" />
                                    </div>
                                </div>
                            </motion.div>
                        </TabsContent>
                         {/* You can add similar content for other tabs here */}
                    </div>
                </Tabs>
            </div>
        </section>
    );
}