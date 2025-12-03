# 🚀 部署指南

本指南将帮助你完成从旧的 VitePress 博客到新的 Next.js 四分支架构的完整迁移。

## 📋 前置准备

确保你已经：
- ✅ 安装了 Git
- ✅ 有 GitHub 账号
- ✅ 仓库名为 `adream-ki.github.io`

## 🔄 完整部署流程

### 第一步：备份现有数据

在开始之前，先备份你的旧博客数据：

```bash
cd D:\OpenProject\adream-ki.github.io

# 备份 VitePress 文档目录
cp -r docs docs_backup
```

### 第二步：初始化 Git 分支结构

#### 2.1 保存并推送 main 分支（新代码）

```bash
# 确保在项目根目录
cd D:\OpenProject\adream-ki.github.io

# 查看当前分支
git branch

# 如果不在 main 分支，创建或切换
git checkout -b main

# 添加所有新的 Next.js 文件
git add .

# 提交
git commit -m "🎉 迁移到 Next.js + 四分支架构"

# 推送到远程 (强制推送，因为是全新架构)
git push -f origin main
```

#### 2.2 创建 post 分支（文章）

```bash
# 创建孤儿分支（无历史记录）
git checkout --orphan post

# 清空所有文件
git rm -rf .

# 复制旧博客的文章
# 假设你的文章在 docs_backup 目录
cp -r docs_backup/Backend/*.md .
cp -r docs_backup/ML/*.md .
cp docs_backup/about.md .

# 如果有图片资源
mkdir -p images
cp -r docs_backup/public/post/* images/ 2>/dev/null || true

# 提交
git add .
git commit -m "📝 初始化文章分支"
git push -u origin post
```

#### 2.3 创建 work 分支（作品）

```bash
# 创建孤儿分支
git checkout --orphan work

# 清空所有文件
git rm -rf .

# 创建 projects.json
cat > projects.json << 'EOF'
[
  {
    "title": "Adream 小站",
    "description": "基于 Next.js 的个人博客系统",
    "tags": ["Next.js", "React", "Tailwind"],
    "github": "https://github.com/adream-ki/adream-ki.github.io",
    "demo": "https://adream-ki.github.io"
  }
]
EOF

# 提交
git add projects.json
git commit -m "🎨 初始化作品分支"
git push -u origin work
```

#### 2.4 创建 release 分支（部署）

```bash
# 创建孤儿分支
git checkout --orphan release

# 清空所有文件
git rm -rf .

# 创建 .gitkeep
touch .gitkeep

# 提交
git add .gitkeep
git commit --allow-empty -m "🚀 初始化部署分支"
git push -u origin release
```

#### 2.5 切回 main 分支

```bash
git checkout main
```

### 第三步：配置 GitHub Pages

1. 打开浏览器，访问你的仓库：`https://github.com/adream-ki/adream-ki.github.io`
2. 点击 **Settings** (设置)
3. 左侧菜单找到 **Pages**
4. 在 **Source** 下拉菜单选择：
   - Branch: `release`
   - Folder: `/ (root)`
5. 点击 **Save**

### 第四步：触发首次构建

现在推送任意改动到 main、post 或 work 分支都会触发自动构建：

```bash
# 方法1: 手动触发 (推荐)
# 访问 https://github.com/adream-ki/adream-ki.github.io/actions
# 找到 "Deploy Next.js Blog (Multi-Branch)" workflow
# 点击 "Run workflow" -> "Run workflow"

# 方法2: 推送空提交触发
git commit --allow-empty -m "trigger: 首次部署"
git push origin main
```

### 第五步：等待部署完成

1. 访问 `https://github.com/adream-ki/adream-ki.github.io/actions`
2. 查看 Workflow 运行状态
3. 等待所有步骤完成（约 2-3 分钟）
4. 访问 `https://adream-ki.github.io` 查看新博客！

## 📝 日常维护指南

### 发布新文章

```bash
# 切换到 post 分支
git checkout post

# 创建新文章
cat > my-new-article.md << 'EOF'
---
title: "我的新文章"
date: "2024-01-15"
description: "这是一篇新文章"
tags: ["技术", "分享"]
category: "后端"
---

# 正文内容

你的文章内容...
EOF

# 提交并推送
git add my-new-article.md
git commit -m "新增文章：我的新文章"
git push

# 自动触发构建和部署！
```

### 更新作品集

```bash
# 切换到 work 分支
git checkout work

# 编辑 projects.json
# 使用你喜欢的编辑器打开并修改

# 提交并推送
git add projects.json
git commit -m "更新项目列表"
git push

# 自动触发构建和部署！
```

### 修改样式或功能

```bash
# 切换到 main 分支
git checkout main

# 修改代码
# 例如: 编辑 src/components/layout/Header.tsx

# 提交并推送
git add .
git commit -m "更新导航栏样式"
git push

# 自动触发构建和部署！
```

## 🎨 文章迁移技巧

### 批量转换 VitePress Frontmatter

如果你的旧文章使用 VitePress 格式，需要稍作调整：

**VitePress 格式：**
```yaml
---
title: 文章标题
description: 描述
---
```

**Next.js 格式（需要添加 date 和 tags）：**
```yaml
---
title: 文章标题
date: "2024-01-01"
description: 描述
tags: ["标签1", "标签2"]
category: "分类"
---
```

可以使用以下脚本批量处理（在 post 分支执行）：

```bash
# 为所有 .md 文件添加默认日期和标签
for file in *.md; do
  if [ "$file" != "about.md" ]; then
    # 检查是否已有 date 字段
    if ! grep -q "date:" "$file"; then
      # 在 --- 后插入 date 字段
      sed -i '/^---$/a date: "2024-01-01"\ntags: ["待分类"]' "$file"
    fi
  fi
done
```

## 🔧 故障排查

### Q: GitHub Actions 构建失败？

**A: 检查以下几点：**
1. 确保所有分支都已创建并推送
2. 检查 Actions 日志查看具体错误
3. 确认 package.json 中的依赖版本正确

### Q: 页面显示"暂无文章"？

**A: 检查：**
1. post 分支是否有 .md 文件？
2. 文章是否包含正确的 Front Matter？
3. CI 构建日志中是否有挂载 post 分支？

### Q: 样式显示异常？

**A: 尝试：**
1. 清除浏览器缓存
2. 检查 Tailwind 配置是否正确
3. 确认 globals.css 已正确导入

## 📊 分支管理最佳实践

### 分支切换快捷命令

```bash
# 创建别名（添加到 ~/.bashrc 或 ~/.zshrc）
alias gpost='git checkout post'
alias gwork='git checkout work'
alias gmain='git checkout main'

# 使用示例
gpost        # 快速切换到 post 分支
gwork        # 快速切换到 work 分支
gmain        # 快速切换到 main 分支
```

### 避免误操作

```bash
# 在每个分支设置不同的提示（可选）
# 在 post 分支
git config user.name "Adream (Writer)"

# 在 main 分支
git config user.name "Adream (Developer)"
```

## 🎉 完成！

恭喜！你已经成功部署了一个现代化的四分支博客系统。

现在你可以：
- ✅ 在 `post` 分支专心写作
- ✅ 在 `work` 分支管理作品
- ✅ 在 `main` 分支开发功能
- ✅ 让 CI 自动处理部署

**访问你的新博客：** https://adream-ki.github.io

---

如有问题，请查看 [README.md](./README.md) 或提交 Issue。
