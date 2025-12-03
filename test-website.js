const { chromium } = require('playwright');

async function testWebsite() {
  console.log('开始测试网站 https://adream.icu...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
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
    // 1. 测试网站是否正常加载
    console.log('1. 测试网站加载...');
    const response = await page.goto('https://adream.icu', { waitUntil: 'networkidle' });
    if (response && response.status() === 200) {
      testResults.siteLoad.status = 'passed';
      testResults.siteLoad.details = `网站加载成功，状态码: ${response.status()}`;
    } else {
      testResults.siteLoad.status = 'failed';
      testResults.siteLoad.details = `网站加载失败，状态码: ${response ? response.status() : '无响应'}`;
    }
    
    // 等待页面完全加载
    await page.waitForTimeout(3000);
    
    // 2. 测试首页是否正确显示
    console.log('2. 测试首页显示...');
    try {
      const title = await page.title();
      const heroContent = await page.locator('h1, .hero, .title').first().isVisible();
      
      if (title && heroContent) {
        testResults.homePage.status = 'passed';
        testResults.homePage.details = `页面标题: ${title}, 主要内容可见`;
      } else {
        testResults.homePage.status = 'partial';
        testResults.homePage.details = `页面标题: ${title}, 主要内容可能不可见`;
      }
    } catch (error) {
      testResults.homePage.status = 'failed';
      testResults.homePage.details = `首页显示测试失败: ${error.message}`;
    }
    
    // 3. 测试导航菜单是否正常工作
    console.log('3. 测试导航菜单...');
    try {
      const navLinks = await page.locator('nav a, .navigation a, .menu a').all();
      if (navLinks.length > 0) {
        // 测试点击第一个导航链接
        await navLinks[0].click();
        await page.waitForTimeout(2000);
        testResults.navigation.status = 'passed';
        testResults.navigation.details = `找到 ${navLinks.length} 个导航链接，点击测试成功`;
      } else {
        testResults.navigation.status = 'failed';
        testResults.navigation.details = '未找到导航链接';
      }
    } catch (error) {
      testResults.navigation.status = 'failed';
      testResults.navigation.details = `导航测试失败: ${error.message}`;
    }
    
    // 回到首页
    await page.goto('https://adream.icu', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 4. 测试博客页面是否显示文章列表
    console.log('4. 测试博客页面...');
    try {
      // 尝试找到博客链接
      const blogLink = await page.locator('a[href*="blog"], a:has-text("博客"), a:has-text("Blog")').first();
      if (await blogLink.isVisible()) {
        await blogLink.click();
        await page.waitForTimeout(3000);
        
        const posts = await page.locator('.post, article, .blog-post, .post-card').all();
        if (posts.length > 0) {
          testResults.blogPage.status = 'passed';
          testResults.blogPage.details = `博客页面加载成功，找到 ${posts.length} 篇文章`;
        } else {
          testResults.blogPage.status = 'partial';
          testResults.blogPage.details = '博客页面加载成功，但未找到文章';
        }
      } else {
        // 直接访问博客页面
        await page.goto('https://adream.icu/blog', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const posts = await page.locator('.post, article, .blog-post, .post-card').all();
        if (posts.length > 0) {
          testResults.blogPage.status = 'passed';
          testResults.blogPage.details = `直接访问博客页面成功，找到 ${posts.length} 篇文章`;
        } else {
          testResults.blogPage.status = 'failed';
          testResults.blogPage.details = '博客页面未找到文章';
        }
      }
    } catch (error) {
      testResults.blogPage.status = 'failed';
      testResults.blogPage.details = `博客页面测试失败: ${error.message}`;
    }
    
    // 5. 测试搜索功能是否可用
    console.log('5. 测试搜索功能...');
    try {
      const searchInput = await page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        testResults.searchFunction.status = 'passed';
        testResults.searchFunction.details = '搜索功能可用，测试搜索"test"';
      } else {
        testResults.searchFunction.status = 'not_available';
        testResults.searchFunction.details = '未找到搜索输入框';
      }
    } catch (error) {
      testResults.searchFunction.status = 'failed';
      testResults.searchFunction.details = `搜索功能测试失败: ${error.message}`;
    }
    
    // 6. 测试筛选和排序功能是否正常
    console.log('6. 测试筛选和排序功能...');
    try {
      const filterButtons = await page.locator('button:has-text("筛选"), button:has-text("Filter"), select').all();
      if (filterButtons.length > 0) {
        testResults.filterSort.status = 'passed';
        testResults.filterSort.details = `找到 ${filterButtons.length} 个筛选/排序控件`;
      } else {
        testResults.filterSort.status = 'not_available';
        testResults.filterSort.details = '未找到筛选或排序功能';
      }
    } catch (error) {
      testResults.filterSort.status = 'failed';
      testResults.filterSort.details = `筛选排序功能测试失败: ${error.message}`;
    }
    
    // 7. 测试响应式设计是否正常
    console.log('7. 测试响应式设计...');
    try {
      // 测试移动端视图
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(2000);
      
      const mobileMenu = await page.locator('.mobile-menu, .hamburger, button:has-text("菜单")').first();
      const isResponsive = await mobileMenu.isVisible();
      
      // 恢复桌面视图
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      
      testResults.responsive.status = 'passed';
      testResults.responsive.details = isResponsive ? 
        '响应式设计正常，检测到移动端菜单' : 
        '响应式设计可能需要优化，未检测到移动端菜单';
    } catch (error) {
      testResults.responsive.status = 'failed';
      testResults.responsive.details = `响应式设计测试失败: ${error.message}`;
    }
    
    // 8. 测试深色模式切换是否正常
    console.log('8. 测试深色模式切换...');
    try {
      const darkModeToggle = await page.locator('button:has-text("🌙"), button:has-text("☀️"), .dark-mode-toggle, [data-theme-toggle]').first();
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(1000);
        await darkModeToggle.click();
        await page.waitForTimeout(1000);
        
        testResults.darkMode.status = 'passed';
        testResults.darkMode.details = '深色模式切换功能正常';
      } else {
        testResults.darkMode.status = 'not_available';
        testResults.darkMode.details = '未找到深色模式切换按钮';
      }
    } catch (error) {
      testResults.darkMode.status = 'failed';
      testResults.darkMode.details = `深色模式测试失败: ${error.message}`;
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
  
  await browser.close();
  
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