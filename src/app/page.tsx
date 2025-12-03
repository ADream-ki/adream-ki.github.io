import Link from "next/link";
import { ArrowRight, Github, Mail, Sparkles } from "lucide-react";
import HeroAnimation from "@/components/home/HeroAnimation";
import { getPostMetadata } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

export default function Home() {
  const latestPosts = getPostMetadata().slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12">
        <div className="flex-1 text-center lg:text-left space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-soft">
            <Sparkles className="w-4 h-4" />
            欢迎来到我的数字花园
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block text-slate-900 dark:text-slate-50">
              探索无限
            </span>
            <span className="block mt-2 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent animate-gradient bg-300%">
              记录美好
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            在这里分享技术探索、学习笔记与生活感悟。
            <br />
            希望这片小天地能给你带来一些启发与温暖。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/blog"
              className="group inline-flex items-center justify-center h-14 px-8 rounded-3xl bg-gradient-to-r from-primary-500 to-accent-400 text-white font-medium shadow-anime hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              开始阅读
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/adream-ki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-14 px-8 rounded-3xl border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-primary-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-600 transition-all duration-300 shadow-soft hover:shadow-anime"
            >
              <Github className="mr-2 w-5 h-5" />
              GitHub
            </Link>
          </div>
        </div>

        {/* Hero Animation */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <HeroAnimation />
        </div>
      </section>

      {/* Latest Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              最新文章
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              记录思考，分享知识
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:gap-3 transition-all font-medium group"
          >
            查看全部
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <p className="mb-4">暂无文章</p>
            <p className="text-sm">
              请在 <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">post</code> 分支添加 Markdown 文件
            </p>
          </div>
        )}

        {/* Mobile "View All" link */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium"
          >
            查看全部文章
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 p-12 shadow-anime">
          <div className="relative z-10 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              让我们保持联系
            </h2>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              有问题或想法？欢迎通过邮件或 GitHub 与我交流
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:your-email@example.com"
                className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-white text-primary-600 font-medium hover:scale-105 transition-transform shadow-lg"
              >
                <Mail className="mr-2 w-5 h-5" />
                发送邮件
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}
