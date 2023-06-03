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
		if (mq == 'mobile' || mq == 'tablet') {
			event.preventDefault();
			if (selectedItem.parent('li').hasClass('selected')) {
				selectedItem.parent('li').removeClass('selected');
			} else {
				sidebar.find('.has-children.selected').removeClass('selected');
				// $('.cd-nav>.cd-top-nav').children('li').removeClass('selected');
				selectedItem.parent('li').addClass('selected');
			}
		}
		if (mq == 'desktop') {
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

		if (mq == 'mobile' && topNavigation.parents('.cd-side-nav').length == 0) {
			detachElements();
			topNavigation.appendTo(sidebar);
			searchForm.removeClass('is-hidden').prependTo(sidebar);
		} else if ((mq == 'tablet' || mq == 'desktop') && topNavigation.parents('.cd-side-nav').length > 0) {
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
		if (mq == 'desktop') $('.has-children.selected').removeClass('selected');
	}

	function checkScrollbarPosition() {
		var mq = checkMQ();

		if (mq != 'mobile') {
			var sidebarHeight = sidebar.outerHeight(),
				windowHeight = $(window).height(),
				mainContentHeight = mainContent.outerHeight(),
				scrollTop = $(window).scrollTop();

			((scrollTop + windowHeight > sidebarHeight) && (mainContentHeight - sidebarHeight != 0)) ? sidebar.addClass('is-fixed').css('bottom', 0) : sidebar.removeClass('is-fixed').attr('style', '');
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

	$('#logout').click(function(){
		$.ajax({
			url: "http://127.0.0.1:8000/Authlogin/logout/",       //提交地址：默认是form的action,如果申明,则会覆盖
			method: "POST",
			data: { username: user.username},
			dataType: "json",
			// contentType: 'application/json',  	//一定要指定格式 contentType
			async: false,
			success: function (data) {
				if("1".localeCompare(data.code) == 0){
					user = {}
					localStorage.removeItem(USER_KEY)
					window.location.href = 'index.html';
				}else if("0".localeCompare(data.code)  == 0){
					notices(data.msg);
				}
			},
			error: function (data) {
				notices("请求失败");
			},
		})
	});
});