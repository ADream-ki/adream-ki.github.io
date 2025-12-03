import { getPostContent, getPostMetadata } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getPostMetadata();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostContent(params.slug);
  if (!post) return { title: "文章未找到" };

  return {
    title: `${post.data.title} - Adream 小站`,
    description: post.data.description,
    keywords: post.data.tags?.join(", "),
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostContent(params.slug);

  if (!post) {
    notFound();
  }

  // Estimate reading time (简单估算：250字/分钟)
  const wordCount = post.content.length;
  const readingTime = Math.ceil(wordCount / 250);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        返回列表
      </Link>

      {/* Article header */}
      <header className="mb-12">
        {/* Category badge */}
        {post.data.category && (
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-soft">
              {post.data.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
          {post.data.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time>{post.data.date}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>约 {readingTime} 分钟</span>
          </div>
          {post.data.tags && post.data.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              {post.data.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article content */}
      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-primary-50 dark:prose-code:bg-primary-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-img:rounded-2xl prose-img:shadow-anime">
        <MDXRemote source={post.content} />
      </div>

      {/* Article footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-400 text-white font-medium shadow-soft hover:shadow-anime hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回博客
          </Link>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            感谢阅读
          </div>
        </div>
      </footer>
    </article>
  );
}
