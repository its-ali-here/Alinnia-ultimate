import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import 'leaflet/dist/leaflet.css';
import { GlobalDateRangeProvider } from "@/context/GlobalDateRangeContext"

export const metadata: Metadata = {
  title: "Alinnia - Business Intelligence",
  description: "Modern financial dashboard and analytics platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <GlobalDateRangeProvider>
                  {children}
                </GlobalDateRangeProvider>
              </TooltipProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}