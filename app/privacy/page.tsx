import React from 'react';
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Shield, Lock, Eye, Globe, UserCheck, Cpu, Database, Cookie, Scale, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12 border-b pb-8">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Shield className="size-8" />
            <span className="font-bold tracking-tight uppercase text-sm">Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">January 2026</span>
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <p className="text-lg leading-relaxed">
              Welcome to <strong>Alinnia</strong> (“we”, “our”, “us”). Alinnia is a business intelligence SaaS platform 
              designed for businesses and their teams. This Privacy Policy explains how we collect, use, store, 
              and protect personal and business data when you use our website and services.
            </p>
          </section>

          <div className="grid gap-12">
            <PolicySection icon={<Globe />} title="1. Jurisdiction & Scope">
              <p>Alinnia operates under the jurisdiction of <strong>Pakistan</strong>. This policy applies to our public website and web application. Our services are intended for <strong>business use only</strong> and users must be 18 years or older.</p>
            </PolicySection>

            <PolicySection icon={<UserCheck />} title="2. Who Uses Alinnia">
              <p>Alinnia is designed for business owners, managers, and employees of SMEs. All data processed is associated with a business or organizational account.</p>
            </PolicySection>

            <PolicySection icon={<Eye />} title="3. Information We Collect">
              <h3 className="text-lg font-semibold mt-4">3.1 Account Information</h3>
              <p>Includes name, email, phone number, company name, and job title.</p>
              <h3 className="text-lg font-semibold mt-4">3.2 Business Data</h3>
              <p>We process spreadsheet data, financial metrics, and KPIs. We aim to <strong>encrypt sensitive business data</strong> wherever feasible.</p>
            </PolicySection>

            <PolicySection icon={<Cpu />} title="4. AI & Automated Processing">
              <p>We use AI for insights and recommendations. <strong>Currently, AI-generated data is not permanently stored.</strong> Business data is processed temporarily to provide these insights.</p>
            </PolicySection>

            <PolicySection icon={<Database />} title="5. Data Storage & Infrastructure">
              <p>All data is stored using <strong>Supabase</strong> cloud infrastructure. We do not sell or rent data to third parties; storage is purely for service operation.</p>
            </PolicySection>

            <PolicySection icon={<Cookie />} title="6. Cookies">
              <p>We use <strong>essential cookies only</strong> for authentication and session management. We do not use advertising or tracking cookies.</p>
            </PolicySection>

            <PolicySection icon={<Shield />} title="7. User Rights & Data Security">
              <p>Users have the right to access, edit, or delete their data. We employ encryption in transit and restricted access controls, though no system is 100% secure.</p>
            </PolicySection>

            <PolicySection icon={<Scale />} title="8. Compliance & Changes">
              <p>We aim to comply with applicable data protection laws, including GDPR where relevant. This policy may be updated periodically; changes will be posted on this page.</p>
            </PolicySection>

            <section className="bg-muted p-8 rounded-2xl border flex flex-col items-center text-center">
              <Mail className="size-10 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
              <p className="text-muted-foreground mb-4">Questions regarding your privacy? Reach out to our legal team.</p>
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

function PolicySection({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
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