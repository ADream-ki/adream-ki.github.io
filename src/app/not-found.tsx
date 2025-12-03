import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 bg-clip-text text-transparent opacity-20 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center animate-bounce-slow">
              <Search className="w-16 h-16 text-primary-500 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            页面走丢了
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            抱歉，你访问的页面不存在或已被移除
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-400 text-white font-medium shadow-soft hover:shadow-anime hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            返回首页
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-primary-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-600 transition-all"
          >
            <Search className="w-5 h-5" />
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
}
