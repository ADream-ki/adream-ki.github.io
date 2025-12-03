# ⚡ 快速开始指南

这是一个 5 分钟快速开始指南，帮助你立即体验新博客！

## 🚀 立即体验（本地预览）

### 1. 安装依赖

```bash
cd D:\OpenProject\adream-ki.github.io
npm install
```

### 2. 创建测试数据

```bash
node scripts/create-test-data.js
```

这会创建：
- `posts/` 目录：包含 3 篇示例文章 + about.md
- `data/` 目录：包含示例 projects.json

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问：http://localhost:3000

你会看到：
- ✨ 二次元风格的首页
- 📝 3 篇示例文章
- 🎨 3 个示例项目
- 🌓 深色/浅色主题切换

## 📦 部署到 GitHub Pages

### 方式一：完整部署（推荐）

参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细步骤。

### 方式二：快速部署

```bash
# 1. 提交 main 分支
git add .
git commit -m "🎉 Initial Next.js setup"
git push origin main

# 2. 创建 post 分支
git checkout --orphan post
git rm -rf .

# 复制你的文章（如果有的话）
# cp your-articles/*.md .

# 或创建示例文章
echo "---
title: Hello World
date: 2024-01-01
description: 第一篇文章
tags: [测试]
---
# Hello" > hello.md

git add .
git commit -m "📝 Init posts"
git push -u origin post

# 3. 创建 work 分支
git checkout --orphan work
git rm -rf .

echo '[
  {
    "title": "我的博客",
    "description": "Next.js 博客",
    "tags": ["Next.js"],
    "link": "https://github.com/adream-ki/adream-ki.github.io"
  }
]' > projects.json

git add .
git commit -m "🎨 Init projects"
git push -u origin work

# 4. 创建 release 分支
git checkout --orphan release
git rm -rf .
git commit --allow-empty -m "🚀 Init release"
git push -u origin release

# 5. 回到 main
git checkout main

# 6. 配置 GitHub Pages
# 访问：https://github.com/adream-ki/adream-ki.github.io/settings/pages
# Source: release 分支, / (root) 目录

# 7. 触发部署
# 访问：https://github.com/adream-ki/adream-ki.github.io/actions
# 手动运行 "Deploy Next.js Blog" workflow

# 8. 等待 2-3 分钟，访问：
# https://adream-ki.github.io
```

## 📝 常见任务

### 写新文章

```bash
# 切换到 post 分支
git checkout post

# 创建文章
cat > my-article.md << 'EOF'
---
title: "我的文章"
date: "2024-01-15"
description: "文章描述"
tags: ["标签"]
---

# 内容
EOF

# 提交推送
git add my-article.md
git commit -m "新增文章"
git push

# 自动触发部署！
```

### 修改样式

```bash
# 切换到 main 分支
git checkout main

# 修改文件（例如：tailwind.config.ts）
# ...

# 提交推送
git add .
git commit -m "更新样式"
git push

# 自动触发部署！
```

### 更新项目

```bash
# 切换到 work 分支
git checkout work

# 编辑 projects.json
# ...

# 提交推送
git add projects.json
git commit -m "更新项目"
git push

# 自动触发部署！
```

## 🎨 自定义配置

### 修改网站信息

编辑 `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "你的网站名",
  description: "你的网站描述",
  // ...
};
```

### 修改主题颜色

编辑 `tailwind.config.ts`:

```typescript
colors: {
  primary: { ... },  // 主色：蓝天色
  accent: { ... },   // 强调色：草原绿
}
```

### 修改导航菜单

编辑 `src/components/layout/Header.tsx`:

```typescript
const navItems = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  // 添加更多...
];
```

### 修改联系方式

编辑 `src/app/page.tsx` 中的邮箱链接:

```typescript
<Link href="mailto:your-email@example.com">
```

## 📚 更多资源

- **完整部署指南**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **项目文档**: [README.md](./README.md)
- **Next.js 文档**: https://nextjs.org/docs
- **Tailwind 文档**: https://tailwindcss.com/docs

## 🆘 遇到问题？

### 构建失败

```bash
# 清理缓存重试
rm -rf .next node_modules
npm install
npm run build
```

### 页面空白

检查：
1. 是否创建了 posts 和 data 目录？
2. 文章格式是否正确？
3. 浏览器控制台有无错误？

### 样式异常

```bash
# 重新构建 Tailwind
npm run build
```

## ✨ 下一步

1. ✅ 本地预览完成
2. 📝 开始写你的第一篇文章
3. 🎨 自定义主题和配色
4. 🚀 部署到 GitHub Pages
5. 🌟 与世界分享你的内容

---

**祝你使用愉快！** 🎉

如有问题，欢迎提 Issue：https://github.com/adream-ki/adream-ki.github.io/issues
