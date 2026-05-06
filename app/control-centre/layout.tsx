"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ProjectProvider } from "@/contexts/project-context"
import { AlinniaChatInterface } from "@/components/ai/alinnia-chat-interface"
import { useActiveProject } from "@/contexts/project-context"
import { ArrowRight, Lock } from "lucide-react"

function PaymentGuard({ children }: { children: React.ReactNode }) {
  const { activeProject, loading } = useActiveProject()
  const router = useRouter()

  if (loading) return null

  if (activeProject && !activeProject.guide_purchased) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-[18px] font-semibold text-foreground">
            Unlock your project tracker
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Get your complete renovation guide and full project tracker for a one-time $79.
          </p>
          <button
            onClick={() =>
              activeProject.session_id
                ? router.push(`/results/${activeProject.session_id}`)
                : router.push("/start")
            }
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            Get access <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <AuthGuard>
      <ProjectProvider>
        <div className="flex h-screen flex-col">
          <TopNav
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isCollapsed={isCollapsed} />
            <PaymentGuard>
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
            </PaymentGuard>
          </div>
        </div>
      </ProjectProvider>
    </AuthGuard>
  )
}
