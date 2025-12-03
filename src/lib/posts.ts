import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content mounted from 'post' branch by CI
const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostMetadata {
  title: string;
  date: string;
  description: string;
  tags: string[];
  slug: string;
  category?: string;
}

/**
 * Get all post metadata sorted by date (newest first)
 */
export function getPostMetadata(): PostMetadata[] {
  // Fallback for local development
  if (!fs.existsSync(postsDirectory)) {
    console.warn('[posts.ts] Posts directory not found. Create /posts folder for local testing.');
    return [];
  }

  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .filter((file) => file !== 'about.md') // Exclude about page
    .map((fileName) => {
      const fileContents = fs.readFileSync(
        path.join(postsDirectory, fileName),
        'utf8'
      );
      const matterResult = matter(fileContents);

      return {
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString().split('T')[0],
        description: matterResult.data.description || '',
        tags: matterResult.data.tags || [],
        category: matterResult.data.category,
        slug: fileName.replace(/\.mdx?$/, ''),
      };
    });

  // Sort by date descending
  return posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get single post content by slug
 */
export function getPostContent(slug: string) {
  if (!fs.existsSync(postsDirectory)) return null;

  // Try .md first, then .mdx
  let fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.mdx`);
  }

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return matter(fileContents);
}

/**
 * Get all unique tags from posts
 */
export function getAllTags(): string[] {
  const posts = getPostMetadata();
  const tagsSet = new Set<string>();

  posts.forEach(post => {
    post.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get posts filtered by tag
 */
export function getPostsByTag(tag: string): PostMetadata[] {
  const posts = getPostMetadata();
  return posts.filter(post => post.tags.includes(tag));
}
