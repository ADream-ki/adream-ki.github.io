// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node'
import { themeEN } from './locales/en'
// 开启RSS支持（RSS配置）
import type { Theme } from '@sugarat/theme'

const baseUrl = 'https://adream.icu'
const RSS: Theme.RSSOptions = {
  title: 'Adream',
  baseUrl,
  copyright: 'Copyright (c) 2021-present, Adream',
  description: '你的指尖,拥有改变世界的力量（大前端相关技术分享）',
  language: 'zh-cn',
  image: 'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
  favicon: 'https://adream.icu/favicon.ico',
}

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  locales: {
    en: themeEN
  },
  // 开启RSS支持
  RSS,

  // 搜索
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // search: false,

  // markdown 图表支持（会增加一定的构建耗时）
  mermaid: true,

  // 页脚
  footer: {
    message: `<span target='_blank' style='display:flex;align-items:center;justify-content:center;'>网站由` + `<a href='https://hexo.io/zh-cn/' style='color: #00f'>hexo</a>`+ `迁移至` + `<a href='https://vitepress.dev/zh/' style='color: #00f''>vitepress</a>` + `, 已运行` + ` ${Math.floor((new Date().getTime() - new Date('2021-12-05').getTime()) / (1000 * 60 * 60 * 24))}` + `天` + `</span>`,
    copyright: `MIT License | Adream 2021 - ${new Date().getFullYear()}`
  },

  // 主题色修改
  themeColor: 'el-blue',

  // 文章默认作者
  author: 'Adream',

  // 友链
  friend: [
    
  ],
})

export { blogTheme }
