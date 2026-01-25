"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthGuard } from "@/components/auth/auth-guard"
import { cn } from "@/lib/utils"
import { AlinniaChatInterface } from "@/components/ai/alinnia-chat-interface"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <TopNav 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isCollapsed={isCollapsed} />
          <div className="flex-1 overflow-y-auto">
            <main className="container mx-auto max-w-7xl p-6 lg:p-8">
              {children}
            </main>
          </div>
          {isChatOpen && (
            <div className="w-full lg:w-1/3 border-l">
              <AlinniaChatInterface />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
