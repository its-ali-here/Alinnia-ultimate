import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 max-w-7xl">
              <main className="w-full">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
