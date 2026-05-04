import React from 'react';
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { 
  Scale, 
  UserCheck, 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Database, 
  FileText, 
  Cpu, 
  Activity, 
  Ban, 
  Banknote, 
  AlertTriangle, 
  FileWarning, 
  Globe, 
  RefreshCw, 
  Mail 
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12 border-b pb-8">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Scale className="size-8" />
            <span className="font-bold tracking-tight uppercase text-sm">Legal Terms</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">January 2026</span>
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <p className="text-lg leading-relaxed">
              Welcome to <strong>Alinnia</strong> (“Alinnia”, “we”, “our”, or “us”). These Terms of Service (“Terms”) 
              govern your access to and use of the Alinnia website and web application. By using Alinnia, 
              you agree to be bound by these Terms.
            </p>
          </section>

          <div className="grid gap-12">
            <PolicySection icon={<UserCheck />} title="1. Eligibility">
              <p>Alinnia is for <strong>business use only</strong>. Users must be 18 years or older and authorized to act on behalf of their organization.</p>
            </PolicySection>

            <PolicySection icon={<LayoutDashboard />} title="2. Description of Service">
              <p>Alinnia is a SaaS business intelligence platform for data management, dashboards, and AI-assisted insights. The service is subscription-based and evolves over time.</p>
            </PolicySection>

            <PolicySection icon={<CreditCard />} title="3. Trial & Subscriptions">
              <p>We offer a <strong>3-day free trial</strong> per organization. Continued use requires a monthly or yearly paid subscription. Features and pricing may change with notice.</p>
            </PolicySection>

            <PolicySection icon={<Users />} title="4. Accounts & Organizations">
              <p>Users are restricted to one organization. <strong>Account sharing is strictly prohibited</strong>. You are responsible for maintaining the security of your credentials.</p>
            </PolicySection>

            <PolicySection icon={<Database />} title="5. Data Ownership">
              <p>All data uploaded or generated remains the <strong>property of the customer</strong>. We may use anonymized, aggregated data to improve our service performance.</p>
            </PolicySection>

            <PolicySection icon={<Cpu />} title="6. AI & Advisory Disclaimer">
              <p>AI insights are <strong>advisory only</strong> and do not constitute professional advice. Use of these insights for business decisions is at the user&apos;s <strong>own risk</strong>.</p>
            </PolicySection>

            <PolicySection icon={<Banknote />} title="7. Payments & Refunds">
              <p>Subscription fees are billed in advance. Refunds are only available <strong>within 24 hours of payment</strong>; thereafter, payments are non-refundable.</p>
            </PolicySection>

            <PolicySection icon={<AlertTriangle />} title="8. Limitation of Liability">
              <p>Alinnia is not liable for indirect or consequential damages. Our total liability is limited to the amount paid in the <strong>most recent billing cycle</strong>.</p>
            </PolicySection>

            <PolicySection icon={<Globe />} title="9. Governing Law">
              <p>These Terms are governed by the laws of <strong>Pakistan</strong>, without regard to conflict-of-law rules.</p>
            </PolicySection>

            <section className="bg-muted p-8 rounded-2xl border flex flex-col items-center text-center">
              <Mail className="size-10 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
              <p className="text-muted-foreground mb-4">Contact our legal department for clarification on any of these terms.</p>
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