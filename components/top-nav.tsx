"use client"

import { ChevronLeft, CircleUser, Search, LogOut, FolderPlus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useActiveProject } from "@/contexts/project-context"
import { ModeToggle } from "@/components/mode-toggle"
import { Notifications } from "@/components/notifications"
import { AlinniaChatButton } from "@/components/ai/alinnia-chat-button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function TopNav({
  isCollapsed,
  setIsCollapsed,
  isChatOpen,
  setIsChatOpen,
}: {
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
  isChatOpen: boolean
  setIsChatOpen: (v: boolean) => void
}) {
  const { signOut } = useAuth()
  const { projects, activeProject, setActiveProject, loading } = useActiveProject()

  function daysSinceStart(startDate: string | null | undefined): number | null {
    if (!startDate) return null
    const diff = Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000)
    return diff >= 0 ? diff : null
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6 z-30 flex-shrink-0">
      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Project selector */}
      {loading ? (
        <Skeleton className="h-7 w-40 rounded-md" />
      ) : activeProject ? (
        projects.length > 1 ? (
          // Multiple projects → show a dropdown switcher
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <span className="max-w-[180px] truncate">{activeProject.name}</span>
                {daysSinceStart(activeProject.start_date) !== null && (
                  <>
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                      Day {daysSinceStart(activeProject.start_date)}
                    </span>
                  </>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map(p => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setActiveProject(p)}
                  className={cn("text-sm", p.id === activeProject.id && "font-medium text-primary")}
                >
                  {p.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/signup/wizard" className="flex items-center gap-2 text-sm">
                  <FolderPlus className="h-3.5 w-3.5" /> New project
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Single project → show name + day count
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-medium text-foreground truncate max-w-[220px]">
              {activeProject.name}
            </span>
            {daysSinceStart(activeProject.start_date) !== null && (
              <>
                <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                <span className="text-xs font-normal text-muted-foreground whitespace-nowrap flex-shrink-0">
                  Day {daysSinceStart(activeProject.start_date)}
                </span>
              </>
            )}
          </span>
        )
      ) : (
        // No project
        <Link href="/auth/signup/wizard" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <FolderPlus className="h-3.5 w-3.5" /> Create your first project
        </Link>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-52 bg-muted pl-8 shadow-none border-0 text-sm h-8"
          />
        </div>
        <AlinniaChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
        <Notifications />
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
              <CircleUser className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/control-centre/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
