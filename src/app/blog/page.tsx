import { getPostMetadata, getAllTags } from "@/lib/posts";
import BlogClient from "./BlogClient";

export default function BlogPage() {
  const posts = getPostMetadata();
  const tags = getAllTags();
  const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];

  return <BlogClient posts={posts} tags={tags} categories={categories} />;
}