const https = require('https');
const { JSDOM } = require('jsdom');

// 安装jsdom用于DOM解析
async function installJSDOM() {
  const { execSync } = require('child_process');
  try {
    execSync('npm list jsdom', { stdio: 'ignore' });
  } catch (e) {
    console.log('正在安装jsdom...');
    execSync('npm install --save-dev jsdom', { stdio: 'inherit' });
  }
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testWebsite() {
  console.log('开始测试网站 https://adream.icu...');
  
  const testResults = {
    siteLoad: { status: 'pending', details: '' },
    homePage: { status: 'pending', details: '' },
    navigation: { status: 'pending', details: '' },
    blogPage: { status: 'pending', details: '' },
    searchFunction: { status: 'pending', details: '' },
    filterSort: { status: 'pending', details: '' },
    responsive: { status: 'pending', details: '' },
    darkMode: { status: 'pending', details: '' }
  };
  
  try {
    // 安装依赖
    await installJSDOM();
    
    // 1. 测试网站是否正常加载
    console.log('1. 测试网站加载...');
    const response = await fetchUrl('https://adream.icu');
    
    if (response.statusCode === 200) {
      testResults.siteLoad.status = 'passed';
      testResults.siteLoad.details = `网站加载成功，状态码: ${response.statusCode}`;
    } else {
      testResults.siteLoad.status = 'failed';
      testResults.siteLoad.details = `网站加载失败，状态码: ${response.statusCode}`;
    }
    
    // 2. 解析HTML内容
    console.log('2. 解析页面内容...');
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // 2. 测试首页是否正确显示
    console.log('3. 测试首页显示...');
    const title = document.title;
    const headings = document.querySelectorAll('h1, h2, h3');
    const heroContent = document.querySelector('.hero, .title, .banner');
    
    if (title && headings.length > 0) {
      testResults.homePage.status = 'passed';
      testResults.homePage.details = `页面标题: ${title}, 找到 ${headings.length} 个标题元素`;
    } else {
      testResults.homePage.status = 'partial';
      testResults.homePage.details = `页面标题: ${title}, 标题元素较少`;
    }
    
    // 3. 测试导航菜单是否正常工作
    console.log('4. 测试导航菜单...');
    const navLinks = document.querySelectorAll('nav a, .navigation a, .menu a, header a');
    if (navLinks.length > 0) {
      testResults.navigation.status = 'passed';
      testResults.navigation.details = `找到 ${navLinks.length} 个导航链接`;
      
      // 检查常见的导航链接
      const linkTexts = Array.from(navLinks).map(link => link.textContent.trim()).filter(text => text);
      console.log('导航链接:', linkTexts.join(', '));
    } else {
      testResults.navigation.status = 'failed';
      testResults.navigation.details = '未找到导航链接';
    }
    
    // 4. 测试博客页面是否显示文章列表
    console.log('5. 测试博客页面...');
    const posts = document.querySelectorAll('.post, article, .blog-post, .post-card, .entry');
    const blogLinks = document.querySelectorAll('a[href*="blog"], a:has-text("博客"), a:has-text("Blog")');
    
    if (posts.length > 0) {
      testResults.blogPage.status = 'passed';
      testResults.blogPage.details = `找到 ${posts.length} 篇文章`;
    } else if (blogLinks.length > 0) {
      testResults.blogPage.status = 'partial';
      testResults.blogPage.details = `找到博客链接 ${blogLinks.length} 个，但首页未显示文章`;
    } else {
      testResults.blogPage.status = 'failed';
      testResults.blogPage.details = '未找到文章或博客链接';
    }
    
    // 5. 测试搜索功能是否可用
    console.log('6. 测试搜索功能...');
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]');
    const searchForms = document.querySelectorAll('form[action*="search"], .search-form');
    
    if (searchInputs.length > 0 || searchForms.length > 0) {
      testResults.searchFunction.status = 'passed';
      testResults.searchFunction.details = `找到搜索元素: 输入框 ${searchInputs.length} 个, 表单 ${searchForms.length} 个`;
    } else {
      testResults.searchFunction.status = 'not_available';
      testResults.searchFunction.details = '未找到搜索功能';
    }
    
    // 6. 测试筛选和排序功能是否正常
    console.log('7. 测试筛选和排序功能...');
    const filterButtons = document.querySelectorAll('button:has-text("筛选"), button:has-text("Filter"), select, .filter, .sort');
    const categoryTags = document.querySelectorAll('.tag, .category, .label');
    
    if (filterButtons.length > 0) {
      testResults.filterSort.status = 'passed';
      testResults.filterSort.details = `找到筛选/排序控件 ${filterButtons.length} 个`;
    } else if (categoryTags.length > 0) {
      testResults.filterSort.status = 'partial';
      testResults.filterSort.details = `找到分类标签 ${categoryTags.length} 个，可能支持筛选`;
    } else {
      testResults.filterSort.status = 'not_available';
      testResults.filterSort.details = '未找到筛选或排序功能';
    }
    
    // 7. 测试响应式设计是否正常
    console.log('8. 测试响应式设计...');
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const responsiveClasses = document.querySelectorAll('.container, .grid, .flex, .responsive');
    const mediaQueries = response.data.match(/@media[^{]*{/g) || [];
    
    if (viewportMeta && viewportMeta.getAttribute('content')) {
      testResults.responsive.status = 'passed';
      testResults.responsive.details = `找到viewport meta标签，媒体查询 ${mediaQueries.length} 个`;
    } else {
      testResults.responsive.status = 'partial';
      testResults.responsive.details = `媒体查询 ${mediaQueries.length} 个，但可能缺少viewport设置`;
    }
    
    // 8. 测试深色模式切换是否正常
    console.log('9. 测试深色模式切换...');
    const darkModeToggle = document.querySelectorAll('button:has-text("🌙"), button:has-text("☀️"), .dark-mode-toggle, [data-theme-toggle]');
    const darkModeScripts = response.data.match(/darkMode|dark-mode|theme.*dark/gi) || [];
    
    if (darkModeToggle.length > 0) {
      testResults.darkMode.status = 'passed';
      testResults.darkMode.details = `找到深色模式切换按钮 ${darkModeToggle.length} 个`;
    } else if (darkModeScripts.length > 0) {
      testResults.darkMode.status = 'partial';
      testResults.darkMode.details = `检测到深色模式相关代码 ${darkModeScripts.length} 处，但可能缺少UI控件`;
    } else {
      testResults.darkMode.status = 'not_available';
      testResults.darkMode.details = '未找到深色模式功能';
    }
    
    // 额外的技术分析
    console.log('10. 技术分析...');
    const frameworkIndicators = {
      'Next.js': response.data.match(/next/i) || response.data.match(/_next\//g),
      'React': response.data.match(/react/i) || response.data.match(/React/g),
      'Tailwind CSS': response.data.match(/tailwind/i) || response.data.match(/tw-/g),
      'TypeScript': response.data.match(/typescript/i) || response.data.match(/\.ts/g)
    };
    
    const detectedFrameworks = Object.entries(frameworkIndicators)
      .filter(([name, matches]) => matches && matches.length > 0)
      .map(([name]) => name);
    
    console.log('检测到的技术栈:', detectedFrameworks.join(', '));
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    testResults.siteLoad.status = 'failed';
    testResults.siteLoad.details = `测试失败: ${error.message}`;
  }
  
  // 生成测试报告
  console.log('\n=== 网站测试报告 ===');
  console.log(`测试时间: ${new Date().toLocaleString()}`);
  console.log(`测试网站: https://adream.icu\n`);
  
  Object.entries(testResults).forEach(([testName, result]) => {
    const statusIcon = {
      'passed': '✅',
      'failed': '❌', 
      'partial': '⚠️',
      'not_available': '⏸️',
      'pending': '⏳'
    };
    
    const testNames = {
      'siteLoad': '网站加载',
      'homePage': '首页显示',
      'navigation': '导航菜单',
      'blogPage': '博客页面',
      'searchFunction': '搜索功能',
      'filterSort': '筛选排序',
      'responsive': '响应式设计',
      'darkMode': '深色模式'
    };
    
    console.log(`${statusIcon[result.status]} ${testNames[testName]}: ${result.details}`);
  });
  
  // 统计结果
  const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
  const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
  const partial = Object.values(testResults).filter(r => r.status === 'partial').length;
  const notAvailable = Object.values(testResults).filter(r => r.status === 'not_available').length;
  
  console.log(`\n=== 测试统计 ===`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`⚠️ 部分通过: ${partial}`);
  console.log(`⏸️ 功能不可用: ${notAvailable}`);
  console.log(`总计: ${Object.keys(testResults).length}`);
  
  const successRate = ((passed / Object.keys(testResults).length) * 100).toFixed(1);
  console.log(`成功率: ${successRate}%`);
  
  return testResults;
}

testWebsite().catch(console.error);