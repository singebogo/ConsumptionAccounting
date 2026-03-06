/**
 * 通知模块初始化
 */
$(function() {

    // ===== 初始化通知下拉菜单 =====
    function initNotificationDropdown() {
        const $notificationTrigger = $('#notifications');
        const $notificationMenu = $notificationTrigger.next('ul');

        if ($notificationTrigger.length && $notificationMenu.length) {
            // 首次悬停加载
            $notificationTrigger.one('mouseenter', function() {
                NotificationRenderer.loadNotifications($notificationMenu);
            });

            // 定期刷新未读数量
            NotificationRenderer.loadUnreadCounts();
            setInterval(() => {
                NotificationRenderer.loadUnreadCounts();
            }, 30000); // 30秒
        }
    }

    // ===== 初始化消息下拉菜单 =====
    function initMessageDropdown() {
        const $messageTrigger = $('#messages');
        const $messageMenu = $messageTrigger.next('ul');

        if ($messageTrigger.length && $messageMenu.length) {
            $messageTrigger.one('mouseenter', function() {
                NotificationRenderer.loadMessages($messageMenu);
            });
        }
    }

    // ===== 初始化WebSocket实时通知 =====
    function initWebSocket() {
        if (!('WebSocket' in window)) return;

        // 获取当前主机
        let ws = null;
        let reconnectTimer = null;

        function connect() {
            try {
                ws = new WebSocket(wsUrl);

                ws.onopen = function() {
                    console.log('WebSocket 连接已建立');
                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                        reconnectTimer = null;
                    }
                };

                ws.onmessage = function(e) {
                    try {
                        const data = JSON.parse(e.data);

                        if (data.type === 'notification') {
                            // 有新通知，刷新未读数量
                            NotificationRenderer.loadUnreadCounts();

                            // 显示Toast提示
                            if (window.notices) {
                                const notif = data.data;
                                notices(`📢 ${notif.title}`, 'info');
                            }
                        }
                    } catch (err) {
                        console.error('解析WebSocket消息失败:', err);
                    }
                };

                ws.onclose = function() {
                    console.log('WebSocket 连接已关闭，3秒后重连...');
                    reconnectTimer = setTimeout(connect, 3000);
                };

                ws.onerror = function(error) {
                    console.error('WebSocket 错误:', error);
                };

            } catch (err) {
                console.error('WebSocket 连接失败:', err);
                reconnectTimer = setTimeout(connect, 5000);
            }
        }

        // 用户已登录才建立连接
        if (window.isAuthenticated !== false) {
            connect();
        }
    }

    // ===== 初始化 =====
    initNotificationDropdown();
    initMessageDropdown();

    // 如果支持WebSocket，初始化实时通知
    if (window.ENABLE_WEBSOCKET !== false) {
        initWebSocket();
    }

    // ===== 全局快捷键 =====
    $(document).on('keydown', function(e) {
        // Alt + N 打开通知
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            $('#notifications').trigger('mouseenter');
        }

        // Alt + M 打开消息
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            $('#messages').trigger('mouseenter');
        }
    });

    console.log('✅ 通知模块初始化完成');
});