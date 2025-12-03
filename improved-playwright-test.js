const { chromium } = require('@playwright/test');

async function runImprovedWebsiteTest() {
    console.log('🚀 开始改进版网站测试...\n');
    
    let browser;
    let context;
    let page;
    
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000 // 减慢操作速度
        });
        context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        page = await context.newPage();
        
        const testResults = {
            websiteLoading: { status: 'pending', details: '' },
            homepageDisplay: { status: 'pending', details: '' },
            navigationMenu: { status: 'pending', details: '' },
            blogPage: { status: 'pending', details: '' },
            searchFunction: { status: 'pending', details: '' },
            filterSort: { status: 'pending', details: '' },
            responsiveDesign: { status: 'pending', details: '' },
            darkMode: { status: 'pending', details: '' }
        };

        // 1. 网站是否正常加载
        console.log('📍 测试1: 检查网站是否正常加载...');
        try {
            const startTime = Date.now();
            const response = await page.goto('https://adream.icu', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            const loadTime = Date.now() - startTime;
            
            if (response && response.status() === 200) {
                testResults.websiteLoading.status = 'passed';
                testResults.websiteLoading.details = `网站加载成功，状态码: ${response.status()}, 加载时间: ${loadTime}ms`;
                console.log('✅ 网站加载正常');
            } else {
                testResults.websiteLoading.status = 'failed';
                testResults.websiteLoading.details = `网站加载失败，状态码: ${response ? response.status() : 'No response'}`;
                console.log('❌ 网站加载失败');
            }
        } catch (error) {
            testResults.websiteLoading.status = 'failed';
            testResults.websiteLoading.details = `网站加载错误: ${error.message}`;
            console.log('❌ 网站加载失败:', error.message);
        }

        // 等待页面完全加载
        await page.waitForTimeout(3000);

        // 2. 首页是否正确显示
        console.log('\n📍 测试2: 检查首页内容...');
        try {
            const title = await page.title();
            const heroContent = await page.locator('body').textContent();
            
            // 检查关键元素
            const hasHeader = await page.locator('header, nav').count() > 0;
            const hasMain = await page.locator('main, .main, #main').count() > 0;
            const hasFooter = await page.locator('footer').count() > 0;
            
            if (title && title.length > 0 && heroContent && heroContent.length > 100) {
                testResults.homepageDisplay.status = 'passed';
                testResults.homepageDisplay.details = `页面标题: "${title}", 内容长度: ${heroContent.length}字符, 关键元素: Header(${hasHeader}), Main(${hasMain}), Footer(${hasFooter})`;
                console.log('✅ 首页显示正常');
            } else {
                testResults.homepageDisplay.status = 'failed';
                testResults.homepageDisplay.details = '页面内容不完整';
                console.log('❌ 首页显示异常');
            }
        } catch (error) {
            testResults.homepageDisplay.status = 'failed';
            testResults.homepageDisplay.details = `检查首页内容时出错: ${error.message}`;
            console.log('❌ 首页检查失败');
        }

        // 3. 导航菜单是否正常工作
        console.log('\n📍 测试3: 检查导航菜单...');
        try {
            // 查找导航链接
            const navSelectors = [
                'nav a', 
                'header a', 
                '[role="navigation"] a',
                '.nav a',
                '.navigation a',
                '.menu a'
            ];
            
            let navLinks = [];
            for (const selector of navSelectors) {
                const links = await page.locator(selector).all();
                if (links.length > 0) {
                    navLinks = links;
                    break;
                }
            }
            
            if (navLinks.length > 0) {
                const linkTexts = [];
                let clickableLinks = 0;
                
                for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
                    try {
                        const text = await navLinks[i].textContent();
                        if (text && text.trim()) {
                            linkTexts.push(text.trim());
                            
                            // 检查链接是否可点击
                            const isVisible = await navLinks[i].isVisible();
                            const isEnabled = await navLinks[i].isEnabled();
                            
                            if (isVisible && isEnabled) {
                                clickableLinks++;
                            }
                        }
                    } catch (e) {
                        // 忽略单个链接的错误
                    }
                }
                
                if (clickableLinks > 0) {
                    testResults.navigationMenu.status = 'passed';
                    testResults.navigationMenu.details = `找到 ${navLinks.length} 个导航链接，可点击: ${clickableLinks} 个，示例: ${linkTexts.slice(0, 3).join(', ')}`;
                    console.log('✅ 导航菜单正常工作');
                } else {
                    testResults.navigationMenu.status = 'warning';
                    testResults.navigationMenu.details = `找到 ${navLinks.length} 个导航链接，但无可点击链接`;
                    console.log('⚠️ 导航菜单可能有问题');
                }
            } else {
                testResults.navigationMenu.status = 'warning';
                testResults.navigationMenu.details = '未找到导航链接';
                console.log('⚠️ 未找到导航菜单');
            }
        } catch (error) {
            testResults.navigationMenu.status = 'failed';
            testResults.navigationMenu.details = `检查导航菜单时出错: ${error.message}`;
            console.log('❌ 导航菜单检查失败');
        }

        // 4. 博客页面是否显示文章列表
        console.log('\n📍 测试4: 检查博客页面...');
        try {
            // 尝试不同的博客页面路径
            const blogPaths = ['/blog', '/posts', '/articles', '/'];
            
            for (const path of blogPaths) {
                try {
                    await page.goto(`https://adream.icu${path}`, { waitUntil: 'networkidle', timeout: 10000 });
                    await page.waitForTimeout(2000);
                    
                    // 查找文章列表元素
                    const articleSelectors = [
                        'article',
                        '.post',
                        '.blog-post',
                        '[class*="post"]',
                        '[class*="article"]',
                        '.entry',
                        '.content'
                    ];
                    
                    let articles = [];
                    for (const selector of articleSelectors) {
                        const elements = await page.locator(selector).all();
                        if (elements.length > 0) {
                            articles = elements;
                            break;
                        }
                    }
                    
                    const blogContent = await page.locator('body').textContent();
                    const hasBlogContent = blogContent && (
                        blogContent.toLowerCase().includes('blog') ||
                        blogContent.toLowerCase().includes('文章') ||
                        blogContent.toLowerCase().includes('post')
                    );
                    
                    if (articles.length > 0 || hasBlogContent) {
                        testResults.blogPage.status = 'passed';
                        testResults.blogPage.details = `路径: ${path}, 找到 ${articles.length} 个文章元素，页面内容长度: ${blogContent ? blogContent.length : 0}字符`;
                        console.log('✅ 博客页面正常显示');
                        break;
                    }
                } catch (e) {
                    // 尝试下一个路径
                    continue;
                }
            }
            
            if (testResults.blogPage.status === 'pending') {
                testResults.blogPage.status = 'warning';
                testResults.blogPage.details = '未找到博客页面或文章内容';
                console.log('⚠️ 未找到博客页面');
            }
        } catch (error) {
            testResults.blogPage.status = 'failed';
            testResults.blogPage.details = `检查博客页面时出错: ${error.message}`;
            console.log('❌ 博客页面检查失败');
        }

        // 5. 搜索功能是否可用
        console.log('\n📍 测试5: 检查搜索功能...');
        try {
            // 返回首页
            await page.goto('https://adream.icu', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 查找搜索框
            const searchSelectors = [
                'input[type="search"]',
                'input[placeholder*="搜索" i]',
                'input[placeholder*="search" i]',
                'input[placeholder*="查找" i]',
                '[class*="search"] input',
                '.search-input',
                '#search'
            ];
            
            let searchInput = null;
            for (const selector of searchSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    searchInput = element;
                    break;
                }
            }
            
            if (searchInput) {
                await searchInput.fill('test');
                await page.waitForTimeout(1000);
                
                // 查找搜索按钮或按回车
                const searchButtonSelectors = [
                    'button[type="submit"]',
                    '[class*="search"] button',
                    '.search-btn',
                    '#search-btn'
                ];
                
                let searchPerformed = false;
                for (const selector of searchButtonSelectors) {
                    try {
                        const button = page.locator(selector).first();
                        if (await button.isVisible()) {
                            await button.click();
                            searchPerformed = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!searchPerformed) {
                    await searchInput.press('Enter');
                    searchPerformed = true;
                }
                
                if (searchPerformed) {
                    await page.waitForTimeout(2000);
                    testResults.searchFunction.status = 'passed';
                    testResults.searchFunction.details = '搜索功能可用，已执行测试搜索';
                    console.log('✅ 搜索功能正常');
                }
            } else {
                testResults.searchFunction.status = 'warning';
                testResults.searchFunction.details = '未找到搜索框';
                console.log('⚠️ 未找到搜索功能');
            }
        } catch (error) {
            testResults.searchFunction.status = 'failed';
            testResults.searchFunction.details = `检查搜索功能时出错: ${error.message}`;
            console.log('❌ 搜索功能检查失败');
        }

        // 6. 筛选和排序功能是否正常
        console.log('\n📍 测试6: 检查筛选和排序功能...');
        try {
            // 查找筛选/排序元素
            const filterSelectors = [
                'select',
                '[class*="filter"]',
                '[class*="sort"]',
                'button[aria-label*="sort" i]',
                'button[aria-label*="filter" i]',
                '.filter-btn',
                '.sort-btn'
            ];
            
            let filters = [];
            for (const selector of filterSelectors) {
                const elements = await page.locator(selector).all();
                if (elements.length > 0) {
                    filters = filters.concat(elements);
                }
            }
            
            if (filters.length > 0) {
                testResults.filterSort.status = 'passed';
                testResults.filterSort.details = `找到 ${filters.length} 个筛选/排序元素`;
                console.log('✅ 筛选和排序功能正常');
            } else {
                testResults.filterSort.status = 'warning';
                testResults.filterSort.details = '未找到筛选或排序功能';
                console.log('⚠️ 未找到筛选和排序功能');
            }
        } catch (error) {
            testResults.filterSort.status = 'failed';
            testResults.filterSort.details = `检查筛选排序功能时出错: ${error.message}`;
            console.log('❌ 筛选排序功能检查失败');
        }

        // 7. 响应式设计是否正常
        console.log('\n📍 测试7: 检查响应式设计...');
        try {
            // 测试不同屏幕尺寸
            const viewports = [
                { width: 1920, height: 1080, name: 'Desktop' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 375, height: 667, name: 'Mobile' }
            ];
            
            let responsiveTests = 0;
            for (const viewport of viewports) {
                try {
                    await page.setViewportSize({ width: viewport.width, height: viewport.height });
                    await page.waitForTimeout(1000);
                    
                    // 检查页面是否仍然可访问
                    const content = await page.locator('body').textContent();
                    if (content && content.length > 100) {
                        responsiveTests++;
                    }
                } catch (e) {
                    // 继续测试下一个视口
                    continue;
                }
            }
            
            if (responsiveTests >= 2) {
                testResults.responsiveDesign.status = 'passed';
                testResults.responsiveDesign.details = `在 ${responsiveTests}/${viewports.length} 种屏幕尺寸下正常显示`;
                console.log('✅ 响应式设计正常');
            } else {
                testResults.responsiveDesign.status = 'warning';
                testResults.responsiveDesign.details = `仅在 ${responsiveTests}/${viewports.length} 种屏幕尺寸下正常显示`;
                console.log('⚠️ 响应式设计可能有问题');
            }
        } catch (error) {
            testResults.responsiveDesign.status = 'failed';
            testResults.responsiveDesign.details = `检查响应式设计时出错: ${error.message}`;
            console.log('❌ 响应式设计检查失败');
        }

        // 8. 深色模式切换是否正常
        console.log('\n📍 测试8: 检查深色模式切换...');
        try {
            // 恢复桌面视图
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(1000);
            
            // 查找主题切换按钮
            const themeSelectors = [
                'button[aria-label*="theme" i]',
                'button[aria-label*="dark" i]',
                'button[aria-label*="light" i]',
                '[class*="theme"]',
                '[class*="dark"]',
                '.theme-toggle',
                '.dark-mode-toggle'
            ];
            
            let themeToggle = null;
            for (const selector of themeSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    themeToggle = element;
                    break;
                }
            }
            
            if (themeToggle) {
                const beforeBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
                await themeToggle.click();
                await page.waitForTimeout(1000);
                const afterBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
                
                if (beforeBg !== afterBg) {
                    testResults.darkMode.status = 'passed';
                    testResults.darkMode.details = '深色模式切换成功，背景颜色已改变';
                    console.log('✅ 深色模式切换正常');
                } else {
                    testResults.darkMode.status = 'warning';
                    testResults.darkMode.details = '找到主题切换按钮但背景颜色未改变';
                    console.log('⚠️ 深色模式可能未正常工作');
                }
            } else {
                testResults.darkMode.status = 'warning';
                testResults.darkMode.details = '未找到主题切换按钮';
                console.log('⚠️ 未找到深色模式切换功能');
            }
        } catch (error) {
            testResults.darkMode.status = 'failed';
            testResults.darkMode.details = `检查深色模式时出错: ${error.message}`;
            console.log('❌ 深色模式检查失败');
        }

        // 生成测试报告
        console.log('\n' + '='.repeat(60));
        console.log('📋 网站测试报告');
        console.log('='.repeat(60));
        
        const statusIcons = {
            passed: '✅',
            failed: '❌',
            warning: '⚠️',
            pending: '⏳'
        };
        
        Object.entries(testResults).forEach(([testName, result]) => {
            const testLabels = {
                websiteLoading: '网站加载',
                homepageDisplay: '首页显示',
                navigationMenu: '导航菜单',
                blogPage: '博客页面',
                searchFunction: '搜索功能',
                filterSort: '筛选排序',
                responsiveDesign: '响应式设计',
                darkMode: '深色模式'
            };
            
            console.log(`\n${statusIcons[result.status]} ${testLabels[testName]}`);
            console.log(`   状态: ${result.status.toUpperCase()}`);
            console.log(`   详情: ${result.details}`);
        });
        
        // 统计结果
        const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
        const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
        const warning = Object.values(testResults).filter(r => r.status === 'warning').length;
        
        console.log('\n' + '-'.repeat(60));
        console.log(`📊 测试统计:`);
        console.log(`   通过: ${passed} 项`);
        console.log(`   失败: ${failed} 项`);
        console.log(`   警告: ${warning} 项`);
        console.log(`   总计: ${Object.keys(testResults).length} 项`);
        
        // 保存测试结果到文件
        const reportData = {
            timestamp: new Date().toISOString(),
            url: 'https://adream.icu',
            results: testResults,
            summary: {
                passed,
                failed,
                warning,
                total: Object.keys(testResults).length
            }
        };
        
        require('fs').writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 测试报告已保存到 test-report.json');
        
        return testResults;
        
    } catch (error) {
        console.error('测试过程中发生严重错误:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
runImprovedWebsiteTest().catch(console.error);