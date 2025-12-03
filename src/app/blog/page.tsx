"use client";
import { useState, useMemo } from "react";
import { getPostMetadata, getAllTags } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import { BookOpen, Tag, Search, Grid, List, Calendar, Filter, ChevronDown } from "lucide-react";

export default function BlogPage() {
  const posts = getPostMetadata();
  const tags = getAllTags();
  const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      
      return matchesSearch && matchesTag && matchesCategory;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchTerm, selectedTag, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-soft mb-6">
          <BookOpen className="w-4 h-4" />
          博客文章
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          探索技术与思考
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          共 {posts.length} 篇文章，{tags.length} 个标签，{categories.length} 个分类
        </p>
      </div>

      {/* Search and Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索文章标题或内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all shadow-soft"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
          >
            <Filter className="w-4 h-4" />
            筛选
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Sort and View Controls */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all"
            >
              <option value="date-desc">最新发布</option>
              <option value="date-asc">最早发布</option>
              <option value="title-asc">标题 A-Z</option>
              <option value="title-desc">标题 Z-A</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-all ${viewMode === "grid" ? "bg-primary-500 text-white" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-all ${viewMode === "list" ? "bg-primary-500 text-white" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-soft space-y-6">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  分类
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      !selectedCategory
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag("")}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      !selectedTag
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    全部
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTag === tag
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        {searchTerm || selectedTag || selectedCategory ? (
          <p>找到 {filteredAndSortedPosts.length} 篇匹配的文章</p>
        ) : (
          <p>显示全部 {filteredAndSortedPosts.length} 篇文章</p>
        )}
      </div>

      {/* Posts Display */}
      {filteredAndSortedPosts.length > 0 ? (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
        }>
          {filteredAndSortedPosts.map((post) => (
            <PostCard key={post.slug} post={post} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 mb-6">
            <Search className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            没有找到匹配的文章
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            尝试调整搜索条件或筛选器
          </p>
          {(searchTerm || selectedTag || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTag("");
                setSelectedCategory("");
              }}
              className="px-6 py-2 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}