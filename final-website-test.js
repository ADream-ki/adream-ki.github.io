const { chromium } = require('@playwright/test');

async function runFinalWebsiteTest() {
    console.log('🚀 开始最终网站测试...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    const testResults = {
        websiteLoading: { status: 'pending', details: '', issues: [] },
        homepageDisplay: { status: 'pending', details: '', issues: [] },
        navigationMenu: { status: 'pending', details: '', issues: [] },
        blogPage: { status: 'pending', details: '', issues: [] },
        searchFunction: { status: 'pending', details: '', issues: [] },
        filterSort: { status: 'pending', details: '', issues: [] },
        responsiveDesign: { status: 'pending', details: '', issues: [] },
        darkMode: { status: 'pending', details: '', issues: [] }
    };

    try {
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
                testResults.websiteLoading.issues.push('网站无法正常访问');
                console.log('❌ 网站加载失败');
            }
        } catch (error) {
            testResults.websiteLoading.status = 'failed';
            testResults.websiteLoading.details = `网站加载错误: ${error.message}`;
            testResults.websiteLoading.issues.push(error.message);
            console.log('❌ 网站加载失败:', error.message);
        }

        await page.waitForTimeout(3000);

        // 2. 首页是否正确显示
        console.log('\n📍 测试2: 检查首页内容...');
        try {
            const title = await page.title();
            const heroContent = await page.locator('body').textContent();
            
            // 检查关键元素
            const hasHeader = await page.locator('header').count() > 0;
            const hasHero = await page.locator('h1, .hero, [class*="hero"]').count() > 0;
            const hasLatestPosts = await page.locator('text=最新文章').count() > 0;
            const hasPostCards = await page.locator('[class*="post"], [class*="card"]').count() > 0;
            
            // 检查具体内容
            const hasWelcomeText = heroContent && heroContent.includes('欢迎来到我的数字花园');
            const hasExploreText = heroContent && heroContent.includes('探索无限');
            const hasBlogLink = await page.locator('a[href="/blog"]').count() > 0;
            
            const issues = [];
            if (!hasHeader) issues.push('缺少Header元素');
            if (!hasHero) issues.push('缺少Hero区域');
            if (!hasLatestPosts) issues.push('缺少最新文章区域');
            if (!hasPostCards) issues.push('缺少文章卡片');
            if (!hasWelcomeText) issues.push('缺少欢迎文本');
            if (!hasExploreText) issues.push('缺少探索文本');
            if (!hasBlogLink) issues.push('缺少博客链接');
            
            if (issues.length === 0) {
                testResults.homepageDisplay.status = 'passed';
                testResults.homepageDisplay.details = `页面标题: "${title}", 内容完整，所有关键元素都存在`;
                console.log('✅ 首页显示正常');
            } else {
                testResults.homepageDisplay.status = 'warning';
                testResults.homepageDisplay.details = `页面基本正常，但存在以下问题: ${issues.join(', ')}`;
                testResults.homepageDisplay.issues = issues;
                console.log('⚠️ 首页显示有小问题');
            }
        } catch (error) {
            testResults.homepageDisplay.status = 'failed';
            testResults.homepageDisplay.details = `检查首页内容时出错: ${error.message}`;
            testResults.homepageDisplay.issues.push(error.message);
            console.log('❌ 首页检查失败');
        }

        // 3. 导航菜单是否正常工作
        console.log('\n📍 测试3: 检查导航菜单...');
        try {
            // 检查导航菜单项
            const navItems = ['首页', '博客', '作品', '关于'];
            const foundNavItems = [];
            const workingNavLinks = [];
            
            for (const item of navItems) {
                try {
                    const navLink = page.locator(`nav >> text=${item}`).first();
                    if (await navLink.isVisible()) {
                        foundNavItems.push(item);
                        
                        // 测试链接点击
                        const href = await navLink.getAttribute('href');
                        if (href) {
                            await navLink.click();
                            await page.waitForTimeout(1000);
                            
                            // 检查是否成功导航
                            const currentUrl = page.url();
                            if (currentUrl.includes(href) || (href === '/' && currentUrl.endsWith('/'))) {
                                workingNavLinks.push(item);
                            }
                            
                            // 返回首页
                            await page.goto('https://adream.icu');
                            await page.waitForTimeout(1000);
                        }
                    }
                } catch (e) {
                    // 忽略单个导航项的错误
                }
            }
            
            // 检查移动端菜单
            const mobileMenuButton = await page.locator('button:has-text("Menu"), button[aria-label*="menu"], .mobile-menu-button').first();
            const hasMobileMenu = await mobileMenuButton.isVisible();
            
            const issues = [];
            if (foundNavItems.length < navItems.length) {
                issues.push(`缺少导航项: ${navItems.filter(item => !foundNavItems.includes(item)).join(', ')}`);
            }
            if (workingNavLinks.length < foundNavItems.length) {
                issues.push(`部分导航链接无法正常工作: ${foundNavItems.filter(item => !workingNavLinks.includes(item)).join(', ')}`);
            }
            if (!hasMobileMenu) {
                issues.push('缺少移动端菜单按钮');
            }
            
            if (issues.length === 0) {
                testResults.navigationMenu.status = 'passed';
                testResults.navigationMenu.details = `所有 ${navItems.length} 个导航项都存在且工作正常`;
                console.log('✅ 导航菜单正常工作');
            } else {
                testResults.navigationMenu.status = 'warning';
                testResults.navigationMenu.details = `导航菜单基本正常，但存在以下问题: ${issues.join(', ')}`;
                testResults.navigationMenu.issues = issues;
                console.log('⚠️ 导航菜单有小问题');
            }
        } catch (error) {
            testResults.navigationMenu.status = 'failed';
            testResults.navigationMenu.details = `检查导航菜单时出错: ${error.message}`;
            testResults.navigationMenu.issues.push(error.message);
            console.log('❌ 导航菜单检查失败');
        }

        // 4. 博客页面是否显示文章列表
        console.log('\n📍 测试4: 检查博客页面...');
        try {
            await page.goto('https://adream.icu/blog', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 检查博客页面标题
            const hasBlogTitle = await page.locator('text=博客文章').count() > 0;
            const hasExploreText = await page.locator('text=探索技术与思考').count() > 0;
            
            // 检查搜索功能
            const hasSearchInput = await page.locator('input[placeholder*="搜索"]').count() > 0;
            const hasSearchIcon = await page.locator('.search, [class*="search"]').count() > 0;
            
            // 检查筛选功能
            const hasFilterButton = await page.locator('button:has-text("筛选"), .filter').count() > 0;
            const hasSortDropdown = await page.locator('select').count() > 0;
            const hasViewModeToggle = await page.locator('button:has-text("网格"), button:has-text("列表")').count() > 0;
            
            // 检查文章显示
            const hasPostCards = await page.locator('[class*="post"], [class*="card"], article').count() > 0;
            const hasNoPostsMessage = await page.locator('text=暂无文章').count() > 0;
            
            const issues = [];
            if (!hasBlogTitle) issues.push('缺少博客页面标题');
            if (!hasExploreText) issues.push('缺少副标题');
            if (!hasSearchInput) issues.push('缺少搜索输入框');
            if (!hasFilterButton) issues.push('缺少筛选按钮');
            if (!hasSortDropdown) issues.push('缺少排序下拉菜单');
            if (!hasViewModeToggle) issues.push('缺少视图模式切换');
            
            // 检查是否有文章内容
            if (!hasPostCards && !hasNoPostsMessage) {
                issues.push('既没有文章卡片也没有"暂无文章"提示');
            }
            
            if (issues.length === 0) {
                testResults.blogPage.status = 'passed';
                testResults.blogPage.details = '博客页面完整，包含所有预期功能';
                console.log('✅ 博客页面正常显示');
            } else {
                testResults.blogPage.status = 'warning';
                testResults.blogPage.details = `博客页面基本正常，但存在以下问题: ${issues.join(', ')}`;
                testResults.blogPage.issues = issues;
                console.log('⚠️ 博客页面有小问题');
            }
        } catch (error) {
            testResults.blogPage.status = 'failed';
            testResults.blogPage.details = `检查博客页面时出错: ${error.message}`;
            testResults.blogPage.issues.push(error.message);
            console.log('❌ 博客页面检查失败');
        }

        // 5. 搜索功能是否可用
        console.log('\n📍 测试5: 检查搜索功能...');
        try {
            await page.goto('https://adream.icu/blog', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            const searchInput = page.locator('input[placeholder*="搜索"]').first();
            const hasSearchInput = await searchInput.isVisible();
            
            if (hasSearchInput) {
                // 测试搜索功能
                await searchInput.fill('test');
                await page.waitForTimeout(1000);
                
                // 检查搜索结果
                const hasSearchResults = await page.locator('[class*="post"], [class*="card"], article').count() > 0;
                const hasNoResultsMessage = await page.locator('text=没有找到匹配的文章').count() > 0;
                
                // 清空搜索
                await searchInput.fill('');
                await page.waitForTimeout(1000);
                
                const issues = [];
                if (!hasSearchResults && !hasNoResultsMessage) {
                    issues.push('搜索后没有显示结果或无结果提示');
                }
                
                if (issues.length === 0) {
                    testResults.searchFunction.status = 'passed';
                    testResults.searchFunction.details = '搜索功能正常，能够输入搜索词并显示结果';
                    console.log('✅ 搜索功能正常');
                } else {
                    testResults.searchFunction.status = 'warning';
                    testResults.searchFunction.details = `搜索功能基本可用，但存在以下问题: ${issues.join(', ')}`;
                    testResults.searchFunction.issues = issues;
                    console.log('⚠️ 搜索功能有小问题');
                }
            } else {
                testResults.searchFunction.status = 'failed';
                testResults.searchFunction.details = '未找到搜索输入框';
                testResults.searchFunction.issues.push('搜索输入框不存在');
                console.log('❌ 搜索功能不可用');
            }
        } catch (error) {
            testResults.searchFunction.status = 'failed';
            testResults.searchFunction.details = `检查搜索功能时出错: ${error.message}`;
            testResults.searchFunction.issues.push(error.message);
            console.log('❌ 搜索功能检查失败');
        }

        // 6. 筛选和排序功能是否正常
        console.log('\n📍 测试6: 检查筛选和排序功能...');
        try {
            await page.goto('https://adream.icu/blog', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 检查筛选按钮
            const filterButton = page.locator('button:has-text("筛选")').first();
            const hasFilterButton = await filterButton.isVisible();
            
            // 检查排序下拉菜单
            const sortDropdown = page.locator('select').first();
            const hasSortDropdown = await sortDropdown.isVisible();
            
            // 检查视图模式切换
            const viewModeButtons = page.locator('button:has-text("网格"), button:has-text("列表")');
            const hasViewModeToggle = await viewModeButtons.count() >= 2;
            
            const issues = [];
            let workingFeatures = 0;
            
            // 测试筛选功能
            if (hasFilterButton) {
                try {
                    await filterButton.click();
                    await page.waitForTimeout(500);
                    
                    // 检查筛选面板是否展开
                    const filterPanel = page.locator('.filter, [class*="filter"]').first();
                    const isFilterPanelVisible = await filterPanel.isVisible();
                    
                    if (isFilterPanelVisible) {
                        workingFeatures++;
                    } else {
                        issues.push('筛选面板无法展开');
                    }
                } catch (e) {
                    issues.push('筛选按钮点击失败');
                }
            } else {
                issues.push('缺少筛选按钮');
            }
            
            // 测试排序功能
            if (hasSortDropdown) {
                try {
                    const currentValue = await sortDropdown.inputValue();
                    await sortDropdown.selectOption({ index: 1 });
                    await page.waitForTimeout(500);
                    workingFeatures++;
                } catch (e) {
                    issues.push('排序下拉菜单无法操作');
                }
            } else {
                issues.push('缺少排序下拉菜单');
            }
            
            // 测试视图模式切换
            if (hasViewModeToggle) {
                try {
                    const firstButton = viewModeButtons.first();
                    await firstButton.click();
                    await page.waitForTimeout(500);
                    workingFeatures++;
                } catch (e) {
                    issues.push('视图模式切换失败');
                }
            } else {
                issues.push('缺少视图模式切换按钮');
            }
            
            if (workingFeatures >= 2 && issues.length === 0) {
                testResults.filterSort.status = 'passed';
                testResults.filterSort.details = '筛选和排序功能都正常工作';
                console.log('✅ 筛选和排序功能正常');
            } else if (workingFeatures >= 1) {
                testResults.filterSort.status = 'warning';
                testResults.filterSort.details = `部分功能可用，问题: ${issues.join(', ')}`;
                testResults.filterSort.issues = issues;
                console.log('⚠️ 筛选和排序功能部分可用');
            } else {
                testResults.filterSort.status = 'failed';
                testResults.filterSort.details = `筛选和排序功能不可用，问题: ${issues.join(', ')}`;
                testResults.filterSort.issues = issues;
                console.log('❌ 筛选和排序功能不可用');
            }
        } catch (error) {
            testResults.filterSort.status = 'failed';
            testResults.filterSort.details = `检查筛选排序功能时出错: ${error.message}`;
            testResults.filterSort.issues.push(error.message);
            console.log('❌ 筛选排序功能检查失败');
        }

        // 7. 响应式设计是否正常
        console.log('\n📍 测试7: 检查响应式设计...');
        try {
            const viewports = [
                { width: 1920, height: 1080, name: 'Desktop' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 375, height: 667, name: 'Mobile' }
            ];
            
            let responsiveTests = 0;
            const issues = [];
            
            for (const viewport of viewports) {
                try {
                    await page.setViewportSize({ width: viewport.width, height: viewport.height });
                    await page.waitForTimeout(1000);
                    
                    // 检查页面内容是否仍然可访问
                    const content = await page.locator('body').textContent();
                    const hasContent = content && content.length > 100;
                    
                    // 检查导航菜单是否适应屏幕
                    const hasNavigation = await page.locator('header, nav').count() > 0;
                    
                    // 在移动端检查移动菜单
                    let hasMobileMenu = true;
                    if (viewport.width <= 768) {
                        const mobileMenuButton = await page.locator('button:has-text("Menu"), .mobile-menu-button').first();
                        hasMobileMenu = await mobileMenuButton.isVisible();
                    }
                    
                    if (hasContent && hasNavigation && hasMobileMenu) {
                        responsiveTests++;
                    } else {
                        issues.push(`${viewport.name} 视图有问题`);
                    }
                } catch (e) {
                    issues.push(`${viewport.name} 视图测试失败`);
                }
            }
            
            if (responsiveTests === viewports.length) {
                testResults.responsiveDesign.status = 'passed';
                testResults.responsiveDesign.details = `在所有 ${viewports.length} 种屏幕尺寸下都正常显示`;
                console.log('✅ 响应式设计正常');
            } else if (responsiveTests >= 2) {
                testResults.responsiveDesign.status = 'warning';
                testResults.responsiveDesign.details = `在 ${responsiveTests}/${viewports.length} 种屏幕尺寸下正常显示，问题: ${issues.join(', ')}`;
                testResults.responsiveDesign.issues = issues;
                console.log('⚠️ 响应式设计有小问题');
            } else {
                testResults.responsiveDesign.status = 'failed';
                testResults.responsiveDesign.details = `响应式设计有严重问题，仅在 ${responsiveTests}/${viewports.length} 种屏幕尺寸下正常`;
                testResults.responsiveDesign.issues = issues;
                console.log('❌ 响应式设计有问题');
            }
        } catch (error) {
            testResults.responsiveDesign.status = 'failed';
            testResults.responsiveDesign.details = `检查响应式设计时出错: ${error.message}`;
            testResults.responsiveDesign.issues.push(error.message);
            console.log('❌ 响应式设计检查失败');
        }

        // 8. 深色模式切换是否正常
        console.log('\n📍 测试8: 检查深色模式切换...');
        try {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('https://adream.icu', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 查找主题切换按钮
            const themeButton = page.locator('button').filter({ has: page.locator('.sun, .moon, [class*="sun"], [class*="moon"]') }).first();
            const hasThemeButton = await themeButton.isVisible();
            
            if (hasThemeButton) {
                // 获取当前主题状态
                const bodyBefore = await page.locator('body').getAttribute('class');
                const htmlBefore = await page.locator('html').getAttribute('class');
                
                // 点击主题切换按钮
                await themeButton.click();
                await page.waitForTimeout(1000);
                
                // 检查主题是否改变
                const bodyAfter = await page.locator('body').getAttribute('class');
                const htmlAfter = await page.locator('html').getAttribute('class');
                
                const themeChanged = (bodyBefore !== bodyAfter) || (htmlBefore !== htmlAfter);
                
                // 再次点击切换回来
                await themeButton.click();
                await page.waitForTimeout(1000);
                
                const issues = [];
                if (!themeChanged) {
                    issues.push('主题切换后页面样式没有明显变化');
                }
                
                if (issues.length === 0) {
                    testResults.darkMode.status = 'passed';
                    testResults.darkMode.details = '深色模式切换功能正常，能够正确改变页面主题';
                    console.log('✅ 深色模式切换正常');
                } else {
                    testResults.darkMode.status = 'warning';
                    testResults.darkMode.details = `主题切换按钮存在，但存在以下问题: ${issues.join(', ')}`;
                    testResults.darkMode.issues = issues;
                    console.log('⚠️ 深色模式切换有小问题');
                }
            } else {
                testResults.darkMode.status = 'failed';
                testResults.darkMode.details = '未找到主题切换按钮';
                testResults.darkMode.issues.push('主题切换按钮不存在');
                console.log('❌ 深色模式切换不可用');
            }
        } catch (error) {
            testResults.darkMode.status = 'failed';
            testResults.darkMode.details = `检查深色模式时出错: ${error.message}`;
            testResults.darkMode.issues.push(error.message);
            console.log('❌ 深色模式检查失败');
        }

    } catch (error) {
        console.error('测试过程中发生严重错误:', error);
    } finally {
        await browser.close();
    }

    // 生成详细测试报告
    console.log('\n' + '='.repeat(80));
    console.log('📋 网站功能测试详细报告');
    console.log('='.repeat(80));
    
    const statusIcons = {
        passed: '✅',
        failed: '❌',
        warning: '⚠️',
        pending: '⏳'
    };
    
    const statusText = {
        passed: '通过',
        failed: '失败',
        warning: '警告',
        pending: '待测试'
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
        console.log(`   状态: ${statusText[result.status]}`);
        console.log(`   详情: ${result.details}`);
        
        if (result.issues && result.issues.length > 0) {
            console.log(`   问题:`);
            result.issues.forEach((issue, index) => {
                console.log(`     ${index + 1}. ${issue}`);
            });
        }
    });
    
    // 统计结果
    const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
    const warning = Object.values(testResults).filter(r => r.status === 'warning').length;
    
    console.log('\n' + '-'.repeat(80));
    console.log(`📊 测试统计:`);
    console.log(`   通过: ${passed} 项`);
    console.log(`   失败: ${failed} 项`);
    console.log(`   警告: ${warning} 项`);
    console.log(`   总计: ${Object.keys(testResults).length} 项`);
    
    // 总体评估
    console.log('\n🎯 总体评估:');
    if (failed === 0 && warning === 0) {
        console.log('   优秀！网站所有功能都正常工作。');
    } else if (failed === 0 && warning <= 2) {
        console.log('   良好！网站主要功能正常，仅有少量小问题。');
    } else if (failed === 0) {
        console.log('   一般！网站基本功能正常，但有一些需要注意的问题。');
    } else if (failed <= 2) {
        console.log('   需要改进！网站有一些功能性问题需要修复。');
    } else {
        console.log('   需要重大改进！网站存在多个严重问题。');
    }
    
    // 保存详细报告
    const reportData = {
        timestamp: new Date().toISOString(),
        url: 'https://adream.icu',
        testResults,
        summary: {
            passed,
            failed,
            warning,
            total: Object.keys(testResults).length
        }
    };
    
    require('fs').writeFileSync('detailed-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 详细测试报告已保存到 detailed-test-report.json');
    
    return testResults;
}

// 运行测试
runFinalWebsiteTest().catch(console.error);