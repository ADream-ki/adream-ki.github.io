#!/usr/bin/env node

/**
 * Create Test Data for Local Development
 *
 * This script creates sample posts and projects data for local testing
 * since the actual content lives in separate Git branches.
 *
 * Usage:
 *   node scripts/create-test-data.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

console.log('🎨 Creating test data for local development...\n');

// Create posts directory and sample posts
const postsDir = path.join(projectRoot, 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir);
  console.log('✅ Created posts/ directory');
}

// Sample post 1
const post1 = `---
title: "欢迎来到 Adream 小站"
date: "2024-01-15"
description: "这是第一篇测试文章，介绍了博客的基本功能"
tags: ["测试", "欢迎"]
category: "公告"
---

# 欢迎

欢迎来到我的个人博客！这里记录了我的学习、思考和生活。

## 特性

- 📝 Markdown 支持
- 🎨 二次元动漫风格
- 🌓 明暗主题切换
- 📱 响应式设计

## 计划

接下来我会分享更多关于技术、生活的内容，敬请期待！
`;

fs.writeFileSync(path.join(postsDir, 'welcome.md'), post1);
console.log('✅ Created welcome.md');

// Sample post 2
const post2 = `---
title: "Next.js 14 新特性解析"
date: "2024-01-20"
description: "深入了解 Next.js 14 带来的激动人心的新功能"
tags: ["Next.js", "React", "前端"]
category: "技术"
---

# Next.js 14 新特性

Next.js 14 带来了许多令人兴奋的新功能。

## Server Actions

Server Actions 是 Next.js 14 中最重要的功能之一...

## Turbopack

Turbopack 是新的打包工具，速度提升了 700%！

## Partial Prerendering

PPR 让页面加载更加快速和流畅。
`;

fs.writeFileSync(path.join(postsDir, 'nextjs-14.md'), post2);
console.log('✅ Created nextjs-14.md');

// Sample post 3
const post3 = `---
title: "Tailwind CSS 实用技巧"
date: "2024-01-25"
description: "分享一些 Tailwind CSS 的实用技巧和最佳实践"
tags: ["Tailwind", "CSS", "前端"]
category: "技术"
---

# Tailwind CSS 实用技巧

Tailwind CSS 是一个功能强大的工具类 CSS 框架。

## 自定义配置

通过 \`tailwind.config.ts\` 可以轻松自定义主题...

## 常用组合

一些常用的 class 组合可以提高开发效率。
`;

fs.writeFileSync(path.join(postsDir, 'tailwind-tips.md'), post3);
console.log('✅ Created tailwind-tips.md');

// Create about.md
const aboutContent = `---
title: "关于我"
date: "2024-01-01"
---

# 你好，我是 Adream

一名热爱技术的开发者，专注于全栈开发和前端工程化。

## 技能

- 前端：React, Next.js, Vue, TypeScript
- 后端：Node.js, Python, FastAPI
- 其他：Docker, Git, Linux

## 兴趣

- 🎮 游戏
- 📚 阅读
- 🎨 设计
- ⛰️ 旅行

## 联系方式

- GitHub: [@adream-ki](https://github.com/adream-ki)
- Email: your-email@example.com

欢迎交流！
`;

fs.writeFileSync(path.join(postsDir, 'about.md'), aboutContent);
console.log('✅ Created about.md');

// Create data directory and projects.json
const dataDir = path.join(projectRoot, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('✅ Created data/ directory');
}

const projects = [
  {
    title: "Adream 小站",
    description: "基于 Next.js 的个人博客系统，采用四分支架构，实现代码与内容的完美分离",
    tags: ["Next.js", "React", "Tailwind CSS"],
    github: "https://github.com/adream-ki/adream-ki.github.io",
    demo: "https://adream-ki.github.io"
  },
  {
    title: "示例项目 A",
    description: "这是一个示例项目，展示如何使用现代化的技术栈构建应用",
    tags: ["TypeScript", "Node.js", "MongoDB"],
    github: "https://github.com/example/project-a"
  },
  {
    title: "示例项目 B",
    description: "另一个有趣的项目，专注于用户体验和性能优化",
    tags: ["Vue", "Vite", "Pinia"],
    demo: "https://example.com/project-b"
  }
];

fs.writeFileSync(
  path.join(dataDir, 'projects.json'),
  JSON.stringify(projects, null, 2)
);
console.log('✅ Created projects.json');

console.log('\n🎉 Test data created successfully!');
console.log('\n📝 You can now run:');
console.log('   npm run dev\n');
console.log('⚠️  Note: These are test files for local development only.');
console.log('   They are ignored by Git and won\'t be committed.\n');
