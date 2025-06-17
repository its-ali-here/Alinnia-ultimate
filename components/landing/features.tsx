import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, PieChart, Target, TrendingUp, Wallet, Users } from "lucide-react"

const features = [
  {
    title: "Account Management",
    description: "Manage multiple accounts and track balances in real-time",
    icon: Wallet,
  },
  {
    title: "Expense Tracking",
    description: "Categorize and monitor your spending habits automatically",
    icon: CreditCard,
  },
  {
    title: "Budget Planning",
    description: "Set budgets and get alerts when you approach limits",
    icon: PieChart,
  },
  {
    title: "Goal Setting",
    description: "Define financial goals and track your progress",
    icon: Target,
  },
  {
    title: "Investment Tracking",
    description: "Monitor your portfolio performance and returns",
    icon: TrendingUp,
  },
  {
    title: "Team Collaboration",
    description: "Share financial insights with your team or family",
    icon: Users,
  },
]

export function Features() {
  return (
    <section className="container px-4 py-24 mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to manage your finances</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Powerful features designed to give you complete control over your financial life
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/50">
            <CardHeader>
              <div className="rounded-lg bg-primary/10 p-2 w-fit">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
