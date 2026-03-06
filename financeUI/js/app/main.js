jQuery(document).ready(function () {

	//cache DOM elements
	var mainContent = $('.cd-main-content'),
		header = $('.cd-main-header'),
		sidebar = $('.cd-side-nav'),
		sidebarTrigger = $('.cd-nav-trigger'),
		topNavigation = $('.cd-top-nav'),
		searchForm = $('.cd-search'),
		contentwrapper = $(".content-wrapper");

		const usermemory = JSON.parse(localStorage.getItem(USER_KEY) || '{}')
		if(!usermemory.username){
			window.location.href = 'login.html';
		}else{
			$('#username').text(usermemory.username)
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

		$.confirm({
			title: '确认退出',
			content: '确定要退出登录吗？',
			buttons: {
				确认: function() {
					$.ajax({
						url: logout_url,
						method: "POST",
						data: { username: user.username},
						dataType: "json",
						success: function(res) {
							if (res.code === '1') {
								// 清除用户信息
								sessionStorage.removeItem('user');
								localStorage.removeItem('rememberUsername');
								// 跳转到登录页
								window.location.href = 'login.html';
							}else if("0".localeCompare(res.code)  === 0){
								notices(data.msg);
							}
						}
					});
				},
				取消: function() {}
			}
		});
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

})