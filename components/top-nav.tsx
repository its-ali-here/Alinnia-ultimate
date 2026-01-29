"use client"
import {
  ChevronLeft,
  CircleUser,
  Menu,
  Package2,
  Search,
  LogOut,
} from "lucide-react"
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
import { ModeToggle } from "@/components/mode-toggle"
import { Notifications } from "@/components/notifications"
import { AlinniaChatButton } from "@/components/ai/alinnia-chat-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function TopNav({ 
  isCollapsed, 
  setIsCollapsed,
  isChatOpen,
  setIsChatOpen
}: { 
  isCollapsed: boolean, 
  setIsCollapsed: (value: boolean) => void,
  isChatOpen: boolean,
  setIsChatOpen: (value: boolean) => void
}) {
  const { signOut, organization, loading: authLoading } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
        </Button>
        {authLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <Link href="/dashboard/organization" className="flex items-center gap-2 font-semibold">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={organization?.logo_url} alt={organization?.name} />
              <AvatarFallback>
                {organization?.name?.charAt(0) || <Package2 className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg hidden sm:inline-block">{organization?.name || 'Dashboard'}</span>
          </Link>
        )}
      </div>

      <div className="w-full flex-1" />
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-80"
          />
        </div>
        <AlinniaChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
        <Notifications />
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer bg-red-500 text-white hover:bg-red-600 focus:bg-red-600"
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