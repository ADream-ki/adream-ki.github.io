"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '作品', href: '/projects' },
  { name: '关于', href: '/about' }
];

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="flex items-center justify-between px-5 py-3 rounded-3xl backdrop-blur-xl border-2 shadow-soft bg-white/90 border-primary-100/50 dark:bg-slate-900/90 dark:border-slate-700/50 transition-all hover:shadow-anime">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent hidden sm:block">
            Adream 小站
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-accent-400 text-white shadow-md"
                    : "text-slate-700 hover:text-primary-600 hover:bg-primary-50/80 dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-slate-800/50"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-2xl hover:bg-primary-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:scale-105"
          >
            {mounted && theme === "dark" ? (
              <Moon size={20} className="text-primary-400" />
            ) : (
              <Sun size={20} className="text-primary-500" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {mobileMenuOpen && (
       <div className="fixed inset-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg pt-28 px-6 md:hidden">
         <div className="flex flex-col space-y-3 max-w-sm mx-auto">
           {navItems.map((item) => {
             const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setMobileMenuOpen(false)}
                 className={cn(
                   "text-lg font-medium py-3 px-5 rounded-2xl transition-all",
                   isActive
                     ? "bg-gradient-to-r from-primary-500 to-accent-400 text-white shadow-md"
                     : "text-slate-900 dark:text-slate-100 hover:bg-primary-50 dark:hover:bg-slate-800"
                 )}
               >
                 {item.name}
               </Link>
             );
           })}
         </div>
       </div>
    )}
    </>
  );
}
