"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Building2,
  FileText,
  Wallet,
  Receipt,
  CreditCard,
  ArrowRightLeft,
  MessagesSquare,
  Video,
  Bot,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  Briefcase,
  Package2, // Added for fallback icon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context" // <-- Import useAuth
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" // <-- Import Avatar components
import { Skeleton } from "@/components/ui/skeleton" // <-- Import Skeleton

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Cash Flow", href: "/dashboard/cash-flow", icon: ArrowRightLeft },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
  { name: "Meetings", href: "/dashboard/meetings", icon: Video },
  { name: "Chat", href: "/dashboard/chat", icon: MessagesSquare },
  { name: "Alinnia AI", href: "/dashboard/ai", icon: Bot },
  { name: "Organization", href: "/dashboard/organization", icon: Building2 },
  { name: "Files", href: "/dashboard/files", icon: FileText },
]

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // --- THIS IS THE NEW LOGIC ---
  const { organization, loading: authLoading } = useAuth() // Get organization and loading state

  const NavItem = ({ item, isBottom = false }: any) => (
    // ... NavItem component remains the same
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            isCollapsed && "justify-center px-2",
          )}
        >
          <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.name}
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col border-r bg-background transition-all duration-300 ease-in-out lg:static",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-border">
            {/* --- THIS IS THE UPDATED HEADER --- */}
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {authLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Link href="/dashboard/organization" className="flex items-center gap-2 font-semibold">
                  <Avatar className="h-8 w-8 border">
                      <AvatarImage src={organization?.logo_url} alt={organization?.name} />
                      <AvatarFallback>
                          {organization?.name?.charAt(0) || <Package2 className="h-5 w-5"/>}
                      </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && <span className="text-lg">{organization?.name || 'Dashboard'}</span>}
                </Link>
              )}
              
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                  <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t border-border p-2">
            {!isCollapsed ? (
                 <nav className="space-y-1">
                    {bottomNavigation.map((item) => (
                        <NavItem key={item.name} item={item} isBottom />
                    ))}
                 </nav>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 w-full"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                    <span className="sr-only">Expand Sidebar</span>
                </Button>
            )}
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}