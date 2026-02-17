"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Building2,
  FileText,
  ArrowRightLeft,
  GitBranch,
  Package,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: Home },
  { name: "Cash Flow", href: "/dashboard/cashflow", icon: ArrowRightLeft },
  { name: "Runway Calendar", href: "/dashboard/runway-calendar", icon: Building2 },
  { name: "What-If Analysis", href: "/dashboard/what-if-analysis", icon: GitBranch },
  { name: "Credit Risk", href: "/dashboard/credit-risk", icon: Shield },
  { name: "Inventory Flow", href: "/dashboard/inventory-flow", icon: Package },
  { name: "Files", href: "/dashboard/files", icon: FileText },
]

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: any }) => (
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