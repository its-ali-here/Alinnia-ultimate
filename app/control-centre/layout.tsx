"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ProjectProvider } from "@/contexts/project-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AuthGuard>
      <ProjectProvider>
        <div className="flex h-screen flex-col">
          <TopNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isCollapsed={isCollapsed} />
            <div className="flex-1 overflow-y-auto">
              <main className="container mx-auto max-w-7xl p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </ProjectProvider>
    </AuthGuard>
  )
}
