import { getPostContent } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { User, Heart } from "lucide-react";

export const metadata = {
  title: "关于我 - Adream 小站",
  description: "了解更多关于我的信息",
};

export default function AboutPage() {
  const post = getPostContent("about");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-soft mb-6">
          <User className="w-4 h-4" />
          关于我
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          {post?.data.title || "你好，世界"}
        </h1>
      </div>

      {/* Content */}
      {post ? (
        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-primary-50 dark:prose-code:bg-primary-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-img:rounded-2xl prose-img:shadow-anime">
          <MDXRemote source={post.content} />
        </article>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 mb-6">
            <Heart className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            关于页面正在准备中
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            请在 <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">post</code> 分支创建{" "}
            <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">about.md</code> 文件
          </p>
          <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 max-w-2xl mx-auto text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-semibold">
              示例格式：
            </p>
            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
              {`---
title: "关于我"
date: "2024-01-01"
---

# 你好，我是 Adream

这里可以写你的自我介绍...`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
