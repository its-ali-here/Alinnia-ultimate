import { RecentTransactions } from "@/components/recent-transactions"
import { BusinessMetrics } from "@/components/business-metrics"
import { ConfigurationBanner } from "@/components/configuration-banner"
import { MarketPulse } from "@/components/market-pulse"

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <ConfigurationBanner />

      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      <p className="text-muted-foreground">
        Here's your business at a glance.
      </p>

      <MarketPulse />

      <BusinessMetrics />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
