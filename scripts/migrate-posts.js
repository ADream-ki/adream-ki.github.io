#!/usr/bin/env node

/**
 * VitePress to Next.js Blog Post Migration Script
 *
 * This script helps migrate VitePress markdown files to the new Next.js format
 * by ensuring all required frontmatter fields are present.
 *
 * Usage:
 *   node scripts/migrate-posts.js <source-dir> <output-dir>
 *
 * Example:
 *   node scripts/migrate-posts.js ./docs_backup/Backend ./migrated-posts
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const sourceDir = args[0] || './docs_backup';
const outputDir = args[1] || './migrated-posts';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 Starting migration...');
console.log(`📂 Source: ${sourceDir}`);
console.log(`📂 Output: ${outputDir}`);
console.log('');

/**
 * Process a markdown file
 */
function processMarkdownFile(filePath, outputPath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    // Check if file has frontmatter
    if (!content.startsWith('---')) {
      console.log(`⚠️  Skipping ${fileName}: No frontmatter found`);
      return;
    }

    // Split frontmatter and content
    const parts = content.split('---');
    if (parts.length < 3) {
      console.log(`⚠️  Skipping ${fileName}: Invalid frontmatter format`);
      return;
    }

    const frontmatter = parts[1];
    const mainContent = parts.slice(2).join('---');

    // Parse frontmatter
    const frontmatterLines = frontmatter.trim().split('\n');
    const meta = {};
    frontmatterLines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        meta[key] = value;
      }
    });

    // Add missing required fields
    if (!meta.date) {
      // Try to extract date from filename or use current date
      const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
      meta.date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    }

    if (!meta.tags) {
      meta.tags = '["待分类"]';
    } else if (!meta.tags.startsWith('[')) {
      // Convert single tag to array
      meta.tags = `["${meta.tags}"]`;
    }

    if (!meta.description && !meta.desc) {
      meta.description = meta.title || '暂无描述';
    } else if (meta.desc && !meta.description) {
      meta.description = meta.desc;
    }

    // Build new frontmatter
    const newFrontmatter = [
      '---',
      `title: "${meta.title || fileName.replace('.md', '')}"`,
      `date: "${meta.date}"`,
      `description: "${meta.description}"`,
      `tags: ${meta.tags}`,
      meta.category ? `category: "${meta.category}"` : null,
      '---',
    ].filter(Boolean).join('\n');

    // Write to output
    const newContent = newFrontmatter + '\n' + mainContent;
    fs.writeFileSync(outputPath, newContent, 'utf-8');
    console.log(`✅ Migrated: ${fileName}`);

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir, outDir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Source directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const newOutDir = path.join(outDir, file);
      if (!fs.existsSync(newOutDir)) {
        fs.mkdirSync(newOutDir, { recursive: true });
      }
      processDirectory(filePath, newOutDir);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const outputPath = path.join(outDir, file);
      processMarkdownFile(filePath, outputPath);
    }
  });
}

// Start processing
processDirectory(sourceDir, outputDir);

console.log('');
console.log('✨ Migration complete!');
console.log(`📦 Output directory: ${outputDir}`);
console.log('');
console.log('📝 Next steps:');
console.log('1. Review migrated files in the output directory');
console.log('2. Copy files to your "post" branch');
console.log('3. Commit and push to trigger deployment');
