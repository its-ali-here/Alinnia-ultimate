// app/dashboard/help/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LifeBuoy, BookOpen, User, BarChart, Settings, Search } from "lucide-react";

const helpCategories = [
    { title: "Getting Started", description: "Learn the basics of Alinnia.", icon: BookOpen },
    { title: "Account & Billing", description: "Manage your account and subscription.", icon: User },
    { title: "Using Analytics", description: "Dive deep into your data.", icon: BarChart },
    { title: "Troubleshooting", description: "Find solutions to common issues.", icon: Settings },
];

const faqItems = [
    {
        question: "How do I upload a new data source?",
        answer: "Navigate to the 'Files' section from the sidebar. You can drag and drop your CSV file or click to browse and upload. The system will automatically process it."
    },
    {
        question: "Can I customize my dashboard?",
        answer: "Yes! In the 'Analytics' tab, you can create new dashboards and add various widgets like charts and summary cards. You can drag and resize them to fit your needs."
    },
    {
        question: "How do I invite team members?",
        answer: "Go to the 'Organization' page. You will find your unique organization code to share, or you can directly invite members via email if you have administrator privileges."
    },
    {
        question: "Where can I find my invoices?",
        answer: "Your billing information and past invoices are available in the 'Account & Billing' section of your settings."
    }
];

export default function HelpPage() {
    return (
        <div className="space-y-8">
            <div className="text-center py-8">
                <LifeBuoy className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-4xl font-bold tracking-tight">Help & Support</h1>
                <p className="mt-2 text-lg text-muted-foreground">We're here to help you get the most out of Alinnia.</p>
                <div className="mt-6 relative max-w-lg mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for articles..." className="pl-10" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Browse by Category</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {helpCategories.map(category => (
                        <Card key={category.title} className="hover:border-primary hover:bg-accent transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <category.icon className="h-6 w-6 text-primary" />
                                <CardTitle className="text-base">{category.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Can't find what you're looking for?</CardTitle>
                    <CardDescription>Our support team is always ready to assist you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Contact Support</Button>
                </CardContent>
            </Card>
        </div>
    );
}