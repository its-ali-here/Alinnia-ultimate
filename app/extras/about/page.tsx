import React from 'react';
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Building2, Target, Users, Sparkles, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12 border-b pb-8">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Building2 className="size-8" />
            <span className="font-bold tracking-tight uppercase text-sm">Company</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">About Alinnia</h1>
          <p className="text-muted-foreground text-lg">
            Empowering businesses with intelligent data insights.
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <p className="text-lg leading-relaxed">
              <strong>Alinnia</strong> is a business intelligence SaaS platform designed to help SMEs 
              make smarter, data-driven decisions. We transform complex business data into actionable 
              insights through intuitive dashboards and AI-powered recommendations.
            </p>
          </section>

          <div className="grid gap-12">
            <AboutSection icon={<Target />} title="Our Mission">
              <p>To democratize business intelligence by making powerful analytics accessible and affordable for small and medium enterprises across Pakistan and beyond.</p>
            </AboutSection>

            <AboutSection icon={<Sparkles />} title="What We Do">
              <p>We provide a comprehensive platform that connects your business data, visualizes key metrics, and delivers AI-assisted insights to help you understand your business performance at a glance.</p>
            </AboutSection>

            <AboutSection icon={<Users />} title="Who We Serve">
              <p>Business owners, managers, and teams who want to leverage their data without the complexity of traditional BI tools. From retail to services, we help businesses of all types.</p>
            </AboutSection>

            <section className="bg-muted p-8 rounded-2xl border flex flex-col items-center text-center">
              <Mail className="size-10 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Get In Touch</h2>
              <p className="text-muted-foreground mb-4">Have questions or want to learn more about Alinnia?</p>
              <a href="mailto:contact@alinnia.com" className="text-primary font-bold hover:underline text-lg">
                contact@alinnia.com
              </a>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

function AboutSection({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <section className="group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <h2 className="text-2xl font-bold m-0">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed pl-12">
        {children}
      </div>
    </section>
  );
}