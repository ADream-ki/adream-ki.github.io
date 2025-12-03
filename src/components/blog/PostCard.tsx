"use client";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, FileText } from "lucide-react";
import { PostMetadata } from "@/lib/posts";

interface PostCardProps {
  post: PostMetadata;
  viewMode?: "grid" | "list";
}

export default function PostCard({ post, viewMode = "grid" }: PostCardProps) {
  if (viewMode === "list") {
    return (
      <Link href={`/blog/${post.slug}`} className="block">
        <article className="flex gap-6 p-6 rounded-3xl border-2 border-slate-200/60 bg-white shadow-soft transition-all dark:border-slate-800 dark:bg-slate-900/50 hover:shadow-anime hover:border-primary-300 dark:hover:border-primary-500/50 group">
          {/* Icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <time>{post.date}</time>
                </div>
                {post.category && (
                  <div className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                    {post.category}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
              {post.description}
            </p>

            {/* Tags */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {post.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 dark:from-primary-900/20 dark:to-accent-900/20 dark:text-primary-300"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow icon */}
              <div className="text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 duration-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <article className="relative h-full overflow-hidden rounded-3xl border-2 border-slate-200/60 bg-white p-6 shadow-soft transition-all dark:border-slate-800 dark:bg-slate-900/50 hover:shadow-anime hover:border-primary-300 dark:hover:border-primary-500/50 group">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 group-hover:from-primary-50/30 group-hover:to-accent-50/30 dark:group-hover:from-primary-900/10 dark:group-hover:to-accent-900/10 transition-all duration-300 rounded-3xl" />

        <div className="relative z-10">
          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time>{post.date}</time>
            </div>
            {post.category && (
              <div className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                {post.category}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
            {post.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 dark:from-primary-900/20 dark:to-accent-900/20 dark:text-primary-300"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Arrow icon */}
            <div className="text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 duration-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
