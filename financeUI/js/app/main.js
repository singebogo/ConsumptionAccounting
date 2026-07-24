jQuery(document).ready(function () {

	//cache DOM elements
	var mainContent = $('.cd-main-content'),
		header = $('.cd-main-header'),
		sidebar = $('.cd-side-nav'),
		sidebarTrigger = $('.cd-nav-trigger'),
		topNavigation = $('.cd-top-nav'),
		searchForm = $('.cd-search'),
		contentwrapper = $(".content-wrapper");


	// 检查登录状态
	let username = null;
	const sessionUser = sessionStorage.getItem(USER_KEY);
	if (sessionUser) {
		try {
			username = JSON.parse(sessionUser).username;
		} catch (e) {
			username = sessionUser;
		}
	}

	if (!username) {
		const localUser = localStorage.getItem(USER_KEY);
		if (localUser) {
			try {
				username = JSON.parse(localUser).username;
			} catch (e) {
				username = localUser;
			}
		}
	}

	if (!username) {
		username = localStorage.getItem('rememberUsername');
	}

	// ✅ 如果还是没有用户名，但页面是首页，尝试从 session 恢复
	if (!username) {
		// 检查是否有 session cookie（通过 AJAX 验证）
		console.warn('没有找到用户信息，尝试使用默认菜单');
		// 不跳转，使用默认菜单
		$('#username').text('访客');
		loadDefaultMenus();
	} else {
		$('#username').text(username);
		// 加载用户菜单
		loadUserMenus();
	}

	//on resize, move search and top nav position according to window width
	var resizing = false;
	moveNavigation();
	$(window).on('resize', function () {
		if (!resizing) {
			(!window.requestAnimationFrame) ? setTimeout(moveNavigation, 300) : window.requestAnimationFrame(moveNavigation);
			resizing = true;
		}
	});

	//on window scrolling - fix sidebar nav
	var scrolling = false;
	checkScrollbarPosition();
	$(window).on('scroll', function () {
		if (!scrolling) {
			(!window.requestAnimationFrame) ? setTimeout(checkScrollbarPosition, 300) : window.requestAnimationFrame(checkScrollbarPosition);
			scrolling = true;
		}
	});

	//mobile only - open sidebar when user clicks the hamburger menu
	sidebarTrigger.on('click', function (event) {
		event.preventDefault();
		$([sidebar, sidebarTrigger]).toggleClass('nav-is-visible');
	});

	//click on item and show submenu
	$('.cd-nav>.cd-top-nav').on('click', 'a', function (e) {
		$e = $(e.target);
		$('.cd-nav>.cd-top-nav').children('li').removeClass('selected');
		var mq = checkMQ(),
		selectedItem = $(this);
		if (mq === 'mobile' || mq === 'tablet') {
			event.preventDefault();
			if (selectedItem.parent('li').hasClass('selected')) {
				selectedItem.parent('li').removeClass('selected');
			} else {
				sidebar.find('.has-children.selected').removeClass('selected');
				// $('.cd-nav>.cd-top-nav').children('li').removeClass('selected');
				selectedItem.parent('li').addClass('selected');
			}
		}
		if (mq === 'desktop') {
			e.preventDefault();
			// $e.parent().parent('li').addClass('selected');
			$e.parents('li').addClass('selected');
			sidebar.find('.has-children.selected').addClass('selected');
		}
	});

	// mouseleave
	$('.cd-nav>.cd-top-nav').mouseleave(function () {
		$('.cd-nav>.cd-top-nav').children('li').removeClass('selected');
	});

	// document - click
	$(document).on('click', function (event) {
		if (!$(event.target).is('.has-children a') && !$(event.target).is('.has-children a span') && !$(event.target).is('.has-children a svg')) {
			sidebar.find('.has-children.selected').removeClass('selected');
			$('.cd-nav>.cd-top-nav').children('li').removeClass('selected');
		}
	});

	//on desktop - differentiate between a user trying to hover over a dropdown item vs trying to navigate into a submenu's contents
	sidebar.children('ul').menuAim({
		activate: function (row) {
			$(row).addClass('hover');
		},
		deactivate: function (row) {
			$(row).removeClass('hover');
		},
		exitMenu: function () {
			sidebar.find('.hover').removeClass('hover');
			return true;
		},
		submenuSelector: ".has-children",
	});

	function checkMQ() {
		//check if mobile or desktop device
		return window.getComputedStyle(document.querySelector('.cd-main-content'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
	}

	function moveNavigation() {
		var mq = checkMQ();

		if (mq === 'mobile' && topNavigation.parents('.cd-side-nav').length === 0) {
			detachElements();
			topNavigation.appendTo(sidebar);
			searchForm.removeClass('is-hidden').prependTo(sidebar);
		} else if ((mq === 'tablet' || mq === 'desktop') && topNavigation.parents('.cd-side-nav').length > 0) {
			detachElements();
			searchForm.insertAfter(header.find('.cd-logo'));
			topNavigation.appendTo(header.find('.cd-nav'));
		}
		checkSelected(mq);
		resizing = false;
	}

	function detachElements() {
		topNavigation.detach();
		searchForm.detach();
	}

	function checkSelected(mq) {
		//on desktop, remove selected class from items selected on mobile/tablet version
		if (mq === 'desktop') $('.has-children.selected').removeClass('selected');
	}

	function checkScrollbarPosition() {
		var mq = checkMQ();

		if (mq !== 'mobile') {
			var sidebarHeight = sidebar.outerHeight(),
				windowHeight = $(window).height(),
				mainContentHeight = mainContent.outerHeight(),
				scrollTop = $(window).scrollTop();

			((scrollTop + windowHeight > sidebarHeight) && (mainContentHeight - sidebarHeight !== 0)) ? sidebar.addClass('is-fixed').css('bottom', 0) : sidebar.removeClass('is-fixed').attr('style', '');
		}
		scrolling = false;
	};

	// 麵包屑

	$('.breadcrumb-item.first').click(function () {
		$(".breadcrumb-item.second").text("");
		$(".breadcrumb-item.active").text("");
	});


	$('.cd-main-content>.cd-side-nav .menuitems').on('click', 'a', function (e) {
		var $ele = $(e.target);

		if ($ele.parent().hasClass("menuitems")) {
			if ($ele.parent().hasClass("overview")) {
				$(".breadcrumb-item.second").text("...");
				$(".breadcrumb-item.active").text("overview");

				$('.cd-side-nav li').removeClass('active');
				$('.cd-side-nav li a').removeClass('submenuactive');

				$ele.addClass("submenuactive");
			}
			return;
		}
		$('.cd-side-nav li').removeClass('active');
		$('.cd-side-nav li a').removeClass('submenuactive');

		$ele.addClass("submenuactive");
		$(".breadcrumb-item.active").text($ele.text());
		var $parents = $ele.parents();

		$.each($parents, function (i, val) {
			if ($(val).hasClass("menuitems")) {
				var obj = $(val).children("a").clone();
				obj.find(':nth-child(n)').remove();
				var parentText = obj.html().trim();
				$(".breadcrumb-item.second").text(parentText);

				// 激活菜單 清理其他已經激活菜單
				$(val).addClass("active");
				return;
			}
		});
	});

	$(".breadcrumb-item.second").text("...");
	$(".breadcrumb-item.active").text("overview");
	
	// 设置iframe的高度
	contentwrapper.css({ height: $(document.body).height() + 56 + 20 + "px" });

	$('#logout').on('click', function(e) {
		e.preventDefault();

		if (confirm('确定要退出登录吗？')) {
			$.ajax({
				url: logout_url,
				method: "POST",
				data: { username: user.username },
				dataType: "json",
				success: function(res) {
					if (res.code === '1') {
						sessionStorage.removeItem('user');
						localStorage.removeItem('rememberUsername');
						localStorage.removeItem('user');
						localStorage.removeItem('isLoggedIn');
						window.location.href = 'login.html';
					} else if ("0".localeCompare(res.code) === 0) {
						notices(data.msg);
					}
				}
			});
		}
	});

	// ===== 3. 锁定屏幕 =====
	$('#lockScreen').on('click', function(e) {
		e.preventDefault();
		// 保存当前状态
		sessionStorage.setItem('lockScreen', 'true');
		sessionStorage.setItem('lockTime', new Date().getTime());
		// 跳转到锁屏页
		window.location.href = 'lock-screen.html';
	});

	// ===== 6. 获取CSRF Token =====
	window.getCookie = function getCookie(name){
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}

	// ===== 7. 激活当前菜单 =====
	function setActiveMenu() {
		var currentPath = window.location.pathname;
		$('.cd-side-nav a').each(function() {
			var href = $(this).attr('href');
			if (href && currentPath.indexOf(href) > -1) {
				$(this).parents('.has-children').addClass('active');
				$(this).addClass('active');
			}
		});
	}
	setActiveMenu();

	/**
	 * 渲染动态菜单
	 * @param {Array} menus - 菜单数据，来自后端 API
	 */
	function renderMenus(menus) {
		const $sidebar = $('.cd-side-nav');
		
		// 保留第一个菜单（Overview）和它的父级 ul
		const $firstUl = $sidebar.find('ul:first');
		const $overviewLi = $firstUl.find('li.overview');
		
		// 清空除第一个 ul 之外的所有菜单
		$sidebar.find('ul:not(:first)').remove();
		
		// 如果没有菜单数据，只显示 Overview
		if (!menus || menus.length === 0) {
			return;
		}
		
		// 菜单分组配置
		const groupMap = {
			'dashboard': { label: 'Main', order: 1 },
			'data_editing': { label: 'Data Editing', order: 2 },
			'views': { label: 'Views', order: 3 },
			'configuration': { label: 'Configuration', order: 4 },
			'metrics': { label: 'Metrics', order: 5 },
			'manager': { label: 'Manager', order: 6 }
		};
		
		// 按分组排序
		const sortedMenus = menus.sort((a, b) => {
			const orderA = groupMap[a.key]?.order || 99;
			const orderB = groupMap[b.key]?.order || 99;
			return orderA - orderB;
		});
		
		// 分组渲染
		let currentGroup = '';
		let groupHtml = '';
		let menuItemsHtml = '';
		
		sortedMenus.forEach((menu, index) => {
			const groupLabel = groupMap[menu.key]?.label || '';
			
			// 如果分组变化，先结束上一个组
			if (groupLabel !== currentGroup && menuItemsHtml) {
				// 结束上一个菜单组
				groupHtml += `<ul>${menuItemsHtml}</ul>`;
				menuItemsHtml = '';
			}
			
			if (groupLabel !== currentGroup) {
				currentGroup = groupLabel;
				// 开始新的菜单组
				groupHtml += `<li class="cd-label">${currentGroup}</li>`;
			}
			
			// 判断是否有子菜单
			const hasChildren = menu.children && menu.children.length > 0;
			const iconClass = menu.icon || 'glyphicon-folder-close';
			
			if (hasChildren) {
				// 有子菜单 - 使用 has-children 结构
				const count = menu.children.length;
				menuItemsHtml += `
					<li class="has-children menuitems ${menu.key}">
						<a href="javascript:void(0);">
							<i class="glyphicon ${iconClass}"></i>
							${menu.name} 
							<span class="count">${count}</span>
							<i style="float: right;" class="glyphicon glyphicon-chevron-right"></i>
						</a>
						<ul>
							${menu.children.map(child => `
								<li>
									<a href="${child.url || 'javascript:void(0);'}" target="main_iframe">
										<i class="glyphicon glyphicon-file"></i>
										${child.name}
									</a>
								</li>
							`).join('')}
						</ul>
					</li>
				`;
			} else {
				// 无子菜单 - 直接显示
				const url = menu.url || 'javascript:void(0);';
				menuItemsHtml += `
					<li class="menuitems ${menu.key}">
						<a href="${url}" target="main_iframe">
							<i class="glyphicon ${iconClass}"></i>
							${menu.name}
						</a>
					</li>
				`;
			}
		});
		
		// 添加最后一个菜单组
		if (menuItemsHtml) {
			groupHtml += `<ul>${menuItemsHtml}</ul>`;
		}
		
		// 将生成的菜单插入到 Overview 之后
		$firstUl.after(groupHtml);
		
		// 重新绑定菜单点击事件
		bindMenuEvents();
		
		console.log('✅ 动态菜单加载完成，共', menus.length, '个菜单项');
	}

	/**
	 * 绑定菜单事件
	 */
	function bindMenuEvents() {
		// 重新绑定侧边栏菜单点击事件
		$('.cd-main-content > .cd-side-nav .menuitems').off('click').on('click', 'a', function(e) {
			var $ele = $(e.target);
			
			// 如果点击的是子菜单项
			if ($ele.parent().hasClass("menuitems")) {
				if ($ele.parent().hasClass("overview")) {
					$(".breadcrumb-item.second").text("...");
					$(".breadcrumb-item.active").text("overview");
					
					$('.cd-side-nav li').removeClass('active');
					$('.cd-side-nav li a').removeClass('submenuactive');
					
					$ele.addClass("submenuactive");
				}
				return;
			}
			
			// 清理之前的高亮
			$('.cd-side-nav li').removeClass('active');
			$('.cd-side-nav li a').removeClass('submenuactive');
			
			// 高亮当前菜单
			$ele.addClass("submenuactive");
			$(".breadcrumb-item.active").text($ele.text());
			
			// 更新面包屑
			var $parents = $ele.parents();
			$.each($parents, function(i, val) {
				if ($(val).hasClass("menuitems")) {
					var obj = $(val).children("a").clone();
					obj.find(':nth-child(n)').remove();
					var parentText = obj.html().trim();
					$(".breadcrumb-item.second").text(parentText);
					
					$(val).addClass("active");
					return;
				}
			});
		});
	}

	/**
	 * 加载用户菜单（从后端 API）
	 */
	function loadUserMenus() {
		// 检查用户是否登录
		let username = null;
		const sessionUser = sessionStorage.getItem(USER_KEY);
		if (sessionUser) {
			try {
				username = JSON.parse(sessionUser).username;
			} catch (e) {
				username = sessionUser;
			}
		}
		if (!username) {
			const localUser = localStorage.getItem(USER_KEY);
			if (localUser) {
				try {
					username = JSON.parse(localUser).username;
				} catch (e) {
					username = localUser;
				}
			}
		}
		
		// 未登录则不请求菜单，使用默认菜单
		if (!username) {
			console.log('用户未登录，使用默认菜单');
			loadDefaultMenus();
			return;
		}
		
		console.log('加载用户菜单...');
		
		$.ajax({
			url: ROLE_API.USER_MENUS,
			type: 'GET',
			data: {
				username: username  // ✅ 传递用户名参数
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(res) {
				console.log('菜单加载响应:', res);
				if (res.code === '1') {
					renderMenus(res.data);
				} else if (res.code === '401') {
					// ✅ 不跳转，使用默认菜单
					console.warn('用户未认证，使用默认菜单');
					loadDefaultMenus();
				} else {
					console.warn('加载菜单失败:', res.msg);
					loadDefaultMenus();
				}
			},
			error: function(xhr) {
				console.warn('加载菜单网络错误，使用默认菜单');
				// ✅ 不跳转，使用默认菜单
				if (xhr.status === 401 || xhr.status === 403) {
					console.warn('认证失败，使用默认菜单');
				}
				loadDefaultMenus();
			}
		});
	}

	/**
	 * 加载默认菜单（当 API 不可用时）
	 */
	function loadDefaultMenus() {
		const defaultMenus = [
			{
				key: 'dashboard',
				name: '概览',
				icon: 'glyphicon-dashboard',
				url: './page/home/home.html',
				children: []
			},
			{
				key: 'data_editing',
				name: '数据编辑',
				icon: 'glyphicon-edit',
				children: [
					{ name: '日常收支', url: './page/edit/DailyInout.html' }
				]
			},
			{
				key: 'views',
				name: '视图',
				icon: 'glyphicon-eye-open',
				children: [
					{ name: '日视图', url: './page/views/DayView.html' },
					{ name: '月视图', url: './page/views/MonthView.html' },
					{ name: '年视图', url: './page/views/AroundYearView.html' }
				]
			},
			{
				key: 'configuration',
				name: '配置',
				icon: 'glyphicon-wrench',
				children: [
					{ name: '基础类型', url: './page/bases/SpendType.html' },
					{ name: '收支类型', url: './page/bases/ExpenseDetailsType.html' }
				]
			},
			{
				key: 'metrics',
				name: '指标',
				icon: 'glyphicon-stats',
				children: [
					{ name: '检测指标', url: './page/edit/DetectionMetrics.html' }
				]
			}
		];
		
		// 管理员额外显示管理菜单
		const isAdmin = checkIsAdmin();
		if (isAdmin) {
			defaultMenus.push({
				key: 'manager',
				name: '管理',
				icon: 'glyphicon-folder-close',
				children: [
					{ name: '所有用户', url: './page/manager/users.html' },
					{ name: '权限管理', url: './page/manager/pages_permission.html' }
				]
			});
		}
		
		renderMenus(defaultMenus);
	}

	/**
	 * 检查当前用户是否是管理员
	 */
	function checkIsAdmin() {
		const userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
		if (userStr) {
			try {
				const user = JSON.parse(userStr);
				// ✅ 多种方式检查管理员权限
				return user.role === '管理员' || 
					user.role === '超级管理员' || 
					user.isAdmin === true || 
					user.is_superuser === true ||
					user.is_staff === true;
			} catch (e) {
				console.error('解析用户信息失败:', e);
				return false;
			}
		}
		return false;
	}


    
    // ===== 7. 激活当前菜单 =====
    function setActiveMenu() {
        var currentPath = window.location.pathname;
        $('.cd-side-nav a').each(function() {
            var href = $(this).attr('href');
            if (href && currentPath.indexOf(href) > -1) {
                $(this).parents('.has-children').addClass('active');
                $(this).addClass('active');
            }
        });
    }
    setActiveMenu();
});