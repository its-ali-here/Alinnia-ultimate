"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, ChevronRight, CircleUser, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, organizationId, signOut, loading: authLoading } = useAuth();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}>
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold">
                    <Image src="/headerlogo.png" alt="Alinnia Logo" width={120} height={32} className="h-8 w-auto invert dark:invert-0" />
                    <span className="sr-only">Alinnia</span>
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
                    <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Testimonials</Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
                    <Link href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
                </nav>
                <div className="hidden md:flex gap-4 items-center">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                        {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    {!authLoading && user ? (
                        // Authenticated user - show Dashboard or Organization setup button
                        <>
                            <Link href={organizationId ? "/dashboard" : "/auth/signup"}>
                                <Button variant="ghost" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                    {organizationId ? "Dashboard" : "Create/Join Organization"}
                                </Button>
                            </Link>
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
                                        <Link href="/dashboard/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Support
                                    </DropdownMenuItem>
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
                        </>
                    ) : (
                        // Unauthenticated user - show login and signup buttons
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/signup/start">
                                <Button className="rounded-full">
                                    Get Started <ChevronRight className="ml-1 size-4" />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4 md:hidden">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">{mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</Button>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}<span className="sr-only">Toggle menu</span></Button>
                </div>
            </div>
            {mobileMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b">
                    <div className="container py-4 flex flex-col gap-4">
                        <Link href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                        <Link href="#testimonials" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
                        <Link href="#pricing" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                        <Link href="#faq" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                        <div className="flex flex-col gap-2 pt-2 border-t">
                            {!authLoading && user ? (
                                // Authenticated user - show Dashboard or Organization setup
                                <>
                                    <Link href={organizationId ? "/dashboard" : "/auth/signup"} className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                                        {organizationId ? "Dashboard" : "Create/Join Organization"}
                                    </Link>
                                    <Link href="/dashboard/settings" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                                        Settings
                                    </Link>
                                    <button
                                        className="py-2 text-sm font-medium text-left text-red-600"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                // Unauthenticated user - show login and signup
                                <>
                                    <Link href="/auth/login" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                                        Log in
                                    </Link>
                                    <Link href="/auth/signup/start" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full rounded-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </header>
    );
}