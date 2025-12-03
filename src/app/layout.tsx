import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Background from "@/components/layout/Background";
import Header from "@/components/layout/Header";
import { createContext } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adream 小站 - 记录生活，发现美",
  description: "一个温暖的二次元风格个人博客，分享技术、生活与思考",
  keywords: ["博客", "技术", "前端", "后端", "机器学习", "Adream"],
  authors: [{ name: "Adream" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen text-slate-900 dark:text-slate-100 antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Background />
          <Header />
          <main className="pt-32 pb-16 min-h-screen">{children}</main>
          <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              <p className="mb-2">
                © {new Date().getFullYear()} Adream 小站 | 已运行{" "}
                {Math.floor(
                  (new Date().getTime() - new Date("2021-12-05").getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                天
              </p>
              <p className="text-xs">
                Built with Next.js & Tailwind CSS | Powered by ❤️
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
