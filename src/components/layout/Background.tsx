"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, createContext } from "react";

export default function Background() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`} />

      {/* Animated clouds effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-64 h-32 bg-white/40 dark:bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-80 h-40 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-1/3 w-72 h-36 bg-accent-200/20 dark:bg-accent-900/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle dots pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${isDark ? '#fff' : '#000'} 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
