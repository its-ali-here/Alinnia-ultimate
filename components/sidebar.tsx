"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  ArrowRightLeft,
  GitBranch,
  Package,
  Shield,
  CalendarClock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const navigation = [
  { name: "Overview", href: "/control-centre/overview", icon: Home },
      { name: "Cash Flow", href: "/control-centre/cashflow", icon: ArrowRightLeft },
      { name: "Timeline", href: "/control-centre/timeline", icon: CalendarClock },
      { name: "Forecasting", href: "/control-centre/forecasting", icon: GitBranch },
      { name: "Credit Risk", href: "/control-centre/credit-risk", icon: Shield },
      { name: "Materials", href: "/control-centre/materials", icon: Package },
      { name: "Files", href: "/control-centre/files", icon: FileText },]

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: any }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            // UPDATED: Increased padding (px-4 py-3) and font size (text-base)
            "flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors",
            pathname === item.href
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            isCollapsed && "justify-center px-2",
          )}
        >
          {/* UPDATED: Increased icon size (h-6 w-6) and margin (mr-4) */}
          <item.icon className={cn("h-6 w-6", !isCollapsed && "mr-4")} />
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
      <div
        className={cn(
          "relative h-full border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-72",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
