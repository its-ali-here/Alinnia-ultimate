"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  TrendingUp,
  Package,
  ListOrdered,
  CheckSquare,
  FileText,
  CircleDollarSign,
  FlagTriangleRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const mainNav = [
  { name: "Overview", href: "/control-centre/overview", icon: LayoutGrid },
  { name: "Cash Flow", href: "/control-centre/cashflow", icon: TrendingUp },
  { name: "Materials", href: "/control-centre/materials", icon: Package },
  { name: "Timeline", href: "/control-centre/timeline", icon: ListOrdered },
  { name: "Punch List", href: "/control-centre/punch-list", icon: CheckSquare },
  { name: "Files", href: "/control-centre/files", icon: FileText },
]

const utilNav = [
  { name: "Budget", href: "/control-centre/forecasting", icon: CircleDollarSign },
  { name: "Close-out", href: "/control-centre/closeout", icon: FlagTriangleRight },
]

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: typeof mainNav[0] }) => {
    const isActive = pathname === item.href
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex h-[38px] w-[38px] items-center justify-center rounded-[9px] transition-colors",
              isActive
                ? "bg-[hsl(var(--brand-soft))] text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.name}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <div className="relative flex h-full w-14 flex-shrink-0 flex-col items-center border-r border-border bg-background py-3 gap-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Separator */}
        <div className="my-1.5 h-px w-6 bg-border" />

        {utilNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>
    </TooltipProvider>
  )
}
