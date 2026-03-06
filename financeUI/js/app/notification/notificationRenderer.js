// js/notification/notificationRenderer.js

/**
 * 通知渲染器 - 负责渲染通知中心和消息中心的下拉菜单
 */
let NotificationRenderer = (function() {

    // ===== 私有配置 =====
    const CONFIG = {
        // API端点
        API: {
            NOTIFICATION_LIST: NOTIFICATION_LIST_url,
            NOTIFICATION_MARK_READ: NOTIFICATION_MARK_READ_url,
            NOTIFICATION_MARK_ALL_READ: NOTIFICATION_MARK_ALL_READ_url,
            NOTIFICATION_DELETE: NOTIFICATION_DELETE_url,
            MESSAGE_LIST: MESSAGE_LIST_url,
            MESSAGE_MARK_READ: MESSAGE_MARK_READ_url,
            UNREAD_COUNT: UNREAD_COUNT_url,
        },

        // 分页设置
        PAGINATION: {
            PAGE_SIZE: 5,
            NOTIFICATION_PAGE_SIZE: 5,
            MESSAGE_PAGE_SIZE: 5
        },

        // 图标映射
        ICONS: {
            // 通知类型图标
            notification_type: {
                'SYSTEM': 'glyphicon-cog',
                'BUDGET': 'glyphicon-warning-sign',
                'IMPORT': 'glyphicon-ok-circle',
                'AUDIT': 'glyphicon-check',
                'TASK': 'glyphicon-tasks',
                'OTHER': 'glyphicon-info-sign'
            },
            // 消息图标
            message: {
                'default': 'glyphicon-envelope',
                'unread': 'glyphicon-envelope',
                'sent': 'glyphicon-send',
                'starred': 'glyphicon-star',
                'attachment': 'glyphicon-paperclip'
            },
            // 优先级图标
            priority: {
                'LOW': 'glyphicon-arrow-down',
                'MEDIUM': 'glyphicon-minus',
                'HIGH': 'glyphicon-arrow-up',
                'URGENT': 'glyphicon-exclamation-sign'
            }
        },

        // 优先级颜色
        PRIORITY_COLORS: {
            'LOW': '#10b981',
            'MEDIUM': '#f59e0b',
            'HIGH': '#f97316',
            'URGENT': '#ef4444'
        }
    };

    // ===== 工具函数 =====

    /**
     * 获取CSRF Token
     */
    function getCsrfToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function getCurrentUser() {
        // 从 localStorage/sessionStorage 获取用户信息
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (user) {
            try {
                userInfo = JSON.parse(user);
                return userInfo.username
            } catch (e) {
                return { username: user };
            }
        }

        // 从页面元素获取（如果存在）
        const $username = $('#username');
        if ($username.length) {
            return { username: $username.text() };
        }

        return null;
    }

    // ===== 新增：检查是否已登录 =====
    function isAuthenticated() {
        return !!getCurrentUser();
    }


    /**
     * 格式化相对时间
     */
    function formatTimeAgo(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return '刚刚';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`;
        if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}天前`;

        // 更早的显示具体日期
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    /**
     * 截断文本
     */
    function truncateText(text, length = 30) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    // ===== 渲染函数 =====

    /**
     * 渲染通知下拉菜单
     */
    function renderNotificationMenu(container, notifications, unreadCount, hasMore = false) {
        if (!container) return;

        let html = '';

        // 头部
        html += `
            <li class="notification-header">
                <span>
                    <i class="glyphicon glyphicon-bell" style="margin-right: 8px; color: #3b82f6;"></i>
                    通知中心
                </span>
                <a href="javascript:void(0);" class="mark-read" id="markAllNotificationsRead">
                    <i class="glyphicon glyphicon-check"></i>
                    全部已读
                </a>
            </li>
        `;

        // 通知列表
        if (notifications && notifications.length > 0) {
            notifications.forEach(item => {
                const notif = item.notification || item;
                const isRead = item.is_read !== undefined ? item.is_read : false;
                const notifId = item.id || notif.id;
                const timeAgo = item.time_ago || formatTimeAgo(item.created_at || notif.created_at);

                // 获取图标
                const typeIcon = CONFIG.ICONS.notification_type[notif.type] || 'glyphicon-info-sign';
                const priorityColor = CONFIG.PRIORITY_COLORS[notif.priority] || '#6b7280';

                // 优先级标签
                let priorityTag = '';
                if (notif.priority === 'URGENT' || notif.priority === 'HIGH') {
                    priorityTag = `<span class="notification-tag" style="background: #fee2e2; color: #dc2626;">${notif.priority_display || '紧急'}</span>`;
                } else if (notif.priority === 'MEDIUM') {
                    priorityTag = `<span class="notification-tag" style="background: #fef3c7; color: #d97706;">${notif.priority_display || '中等'}</span>`;
                }

                html += `
                    <li class="notification-item ${isRead ? 'read' : 'unread'}" data-id="${notifId}" data-notification-id="${notif.id}">
                        <a href="${notif.link_url || 'javascript:void(0);'}" target="${notif.link_url ? 'main_iframe' : '_self'}" class="notification-link">
                            <span class="notification-icon" style="color: ${priorityColor};">
                                <i class="glyphicon ${typeIcon}"></i>
                            </span>
                            <span class="notification-content">
                                <span class="notification-title">
                                    ${truncateText(notif.title, 25)}
                                    ${!isRead ? '<span class="unread-dot"></span>' : ''}
                                </span>
                                <span class="notification-desc">${truncateText(notif.content, 40)}</span>
                                <span class="notification-meta">
                                    <span class="notification-time">
                                        <i class="glyphicon glyphicon-time"></i>
                                        ${timeAgo}
                                    </span>
                                    ${priorityTag}
                                </span>
                            </span>
                        </a>
                    </li>
                `;
            });

            // 加载更多
            if (hasMore) {
                html += `
                    <li class="load-more">
                        <a href="javascript:void(0);" id="loadMoreNotifications">
                            <i class="glyphicon glyphicon-refresh"></i>
                            加载更多
                        </a>
                    </li>
                `;
            }
        } else {
            // 空状态
            html += `
                <li class="empty-state">
                    <i class="glyphicon glyphicon-inbox"></i>
                    <p>暂无新通知</p>
                    <span style="font-size: 12px; color: #94a3b8;">休息一下，稍后再来看看~</span>
                </li>
            `;
        }

        // 底部
        html += `
            <li class="notification-footer">
                <a href="./page/notices/all.html" target="main_iframe">
                    <i class="glyphicon glyphicon-list-alt"></i>
                    查看全部通知
                    <i class="glyphicon glyphicon-chevron-right" style="font-size: 12px; margin-left: 4px;"></i>
                </a>
            </li>
        `;

        container.html(html);

        // 更新徽章
        updateNotificationBadge(unreadCount);

        // 绑定事件
        bindNotificationEvents(container);
    }

    /**
     * 渲染消息下拉菜单
     */
    function renderMessageMenu(container, messages, unreadCount, hasMore = false) {
        if (!container) return;

        let html = '';

        // 头部
        html += `
            <li class="message-header">
                <span>
                    <i class="glyphicon glyphicon-comment" style="margin-right: 8px; color: #8b5cf6;"></i>
                    消息中心
                </span>
                <a href="javascript:void(0);" class="mark-read" id="markAllMessagesRead">
                    <i class="glyphicon glyphicon-check"></i>
                    全部已读
                </a>
            </li>
        `;

        // 消息列表
        if (messages && messages.length > 0) {
            messages.forEach(msg => {
                const isRead = msg.is_read;
                const timeAgo = msg.time_ago || formatTimeAgo(msg.sent_at);

                // 获取发送者首字母作为头像
                const senderInitial = msg.sender_name ? msg.sender_name.charAt(0).toUpperCase() : '?';

                html += `
                    <li class="message-item ${isRead ? 'read' : 'unread'}" data-id="${msg.id}">
                        <a href="./page/messages/detail.html?id=${msg.id}" target="main_iframe">
                            <span class="message-icon">
                                <span class="sender-avatar" style="background: ${getAvatarColor(msg.sender_name)};">
                                    ${senderInitial}
                                </span>
                            </span>
                            <span class="message-content">
                                <span class="message-sender">
                                    <span class="sender-name">${msg.sender_name || '系统'}</span>
                                    ${msg.recipient_name ? `<span class="sender-badge">发给: ${msg.recipient_name}</span>` : ''}
                                </span>
                                <span class="message-title">
                                    ${truncateText(msg.title || '无标题', 20)}
                                    ${!isRead ? '<span class="unread-dot"></span>' : ''}
                                </span>
                                <span class="message-desc">${truncateText(msg.content, 35)}</span>
                                <span class="message-meta">
                                    <span class="message-time">
                                        <i class="glyphicon glyphicon-time"></i>
                                        ${timeAgo}
                                    </span>
                                    ${msg.attachment ? `
                                        <span class="message-attachment-indicator">
                                            <i class="glyphicon glyphicon-paperclip"></i>
                                        </span>
                                    ` : ''}
                                    ${msg.is_starred ? `
                                        <span class="message-starred">
                                            <i class="glyphicon glyphicon-star" style="color: #f59e0b;"></i>
                                        </span>
                                    ` : ''}
                                </span>
                            </span>
                        </a>
                    </li>
                `;
            });

            // 加载更多
            if (hasMore) {
                html += `
                    <li class="load-more">
                        <a href="javascript:void(0);" id="loadMoreMessages">
                            <i class="glyphicon glyphicon-refresh"></i>
                            加载更多
                        </a>
                    </li>
                `;
            }
        } else {
            // 空状态
            html += `
                <li class="empty-state">
                    <i class="glyphicon glyphicon-envelope"></i>
                    <p>暂无新消息</p>
                    <span style="font-size: 12px; color: #94a3b8;">还没有人给你发送消息</span>
                </li>
            `;
        }

        // 快捷操作区
        html += `
            <li class="message-footer" style="display: flex; gap: 8px; padding: 16px 24px;">
                <a href="./page/messages/compose.html" target="main_iframe" style="flex: 1; background: #3b82f6; color: white !important; border: none;">
                    <i class="glyphicon glyphicon-pencil"></i>
                    写消息
                </a>
                <a href="./page/messages/inbox.html" target="main_iframe" style="flex: 1;">
                    <i class="glyphicon glyphicon-folder-open"></i>
                    收件箱
                    ${unreadCount > 0 ? `<span class="badge" style="background: #ef4444; color: white; margin-left: 8px;">${unreadCount}</span>` : ''}
                </a>
            </li>
        `;

        html += `
            <li class="message-footer">
                <a href="./page/messages/all.html" target="main_iframe">
                    <i class="glyphicon glyphicon-th-list"></i>
                    所有消息
                    <i class="glyphicon glyphicon-chevron-right" style="font-size: 12px;"></i>
                </a>
            </li>
        `;

        container.html(html);

        // 更新徽章
        updateMessageBadge(unreadCount);

        // 绑定事件
        bindMessageEvents(container);
    }

    /**
     * 获取头像颜色
     */
    function getAvatarColor(name) {
        if (!name) return '#3b82f6';

        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
            '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#14b8a6'
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // ===== 数据加载函数 =====

    /**
     * 加载通知列表
     */
    function loadNotifications(container, page = 1) {
        if (!container) return Promise.reject('容器不存在');

        // ✅ 未登录时不请求
        if (!isAuthenticated()) {
            console.log('用户未登录，显示空通知');
            renderNotificationMenu(container, [], 0, false);
            return Promise.resolve({ code: '1', data: { list: [], total: 0 } });
        }

        // 显示骨架屏
        container.html(`
            <li class="notification-header">
                <span><i class="glyphicon glyphicon-bell"></i> 通知中心</span>
            </li>
            <li class="skeleton-loading">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line" style="width: 80%;"></div>
            </li>
        `);

        return $.ajax({
            url: CONFIG.API.NOTIFICATION_LIST,
            type: 'GET',
            // xhrFields: {
            //     withCredentials: true  // ✅ 携带 Cookie
            // },
            data: {
                page: page,
                page_size: CONFIG.PAGINATION.NOTIFICATION_PAGE_SIZE
            },
            headers: {
            },
            success: function(res) {
                if (res.code === '1') {
                    const hasMore = res.data.page < Math.ceil(res.data.total / CONFIG.PAGINATION.NOTIFICATION_PAGE_SIZE);
                    renderNotificationMenu(
                        container,
                        res.data.list,
                        res.data.unread_count || 0,
                        hasMore
                    );

                    // 存储当前页码
                    container.data('currentPage', page);
                    container.data('totalPages', Math.ceil(res.data.total / CONFIG.PAGINATION.NOTIFICATION_PAGE_SIZE));
                } else {
                    console.error('加载通知失败:', res.msg);
                    renderNotificationMenu(container, [], 0);
                }
            },
            error: function(xhr) {
                console.error('请求通知失败:', xhr);
                renderNotificationMenu(container, [], 0);
            }
        });
    }

    /**
     * 加载消息列表
     */
    function loadMessages(container, page = 1, folder = 'inbox') {
        if (!container) return Promise.reject('容器不存在');
        // ✅ 未登录时不请求
        if (!isAuthenticated()) {
            console.log('用户未登录，显示空消息');
            renderMessageMenu(container, [], 0, false);
            return Promise.resolve({ code: '1', data: { list: [], total: 0 } });
        }
        // 显示骨架屏
        container.html(`
            <li class="message-header">
                <span><i class="glyphicon glyphicon-comment"></i> 消息中心</span>
            </li>
            <li class="skeleton-loading">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line" style="width: 80%;"></div>
            </li>
        `);
        const token = localStorage.getItem('auth_token') || window.getCookie('sessionid');

        return $.ajax({
            url: CONFIG.API.MESSAGE_LIST,
            type: 'GET',
            // xhrFields: {
            //     withCredentials: true  // ✅ 携带 Cookie
            // },
            data: {
                page: page,
                page_size: CONFIG.PAGINATION.MESSAGE_PAGE_SIZE,
                folder: folder,
                username: getCurrentUser(),
            },
            headers: {

            },
            success: function(res) {
                if (res.code === '1') {
                    const hasMore = res.data.page < Math.ceil(res.data.total / CONFIG.PAGINATION.MESSAGE_PAGE_SIZE);
                    renderMessageMenu(
                        container,
                        res.data.list,
                        res.data.unread_count || 0,
                        hasMore
                    );

                    container.data('currentPage', page);
                    container.data('totalPages', Math.ceil(res.data.total / CONFIG.PAGINATION.MESSAGE_PAGE_SIZE));
                } else if(res.code === '401'){
                    window.location.href = './login.html';
                } else {
                    console.error('加载消息失败:', res.msg);
                    renderMessageMenu(container, [], 0);
                }
            },
            error: function(xhr) {
                console.error('请求消息失败:', xhr);
                renderMessageMenu(container, [], 0);
            }
        });
    }

    // ===== 事件绑定 =====

    /**
     * 绑定通知相关事件
     */
    function bindNotificationEvents(container) {
        // 标记单条通知已读
        container.find('.notification-item.unread .notification-link').off('click').on('click', function(e) {
            const $item = $(this).closest('.notification-item');
            const notificationId = $item.data('notification-id');
            const userNotificationId = $item.data('id');

            // ✅ 未登录时不操作
            if (!isAuthenticated()) {
                if (window.notices) {
                    notices('请先登录', 'warning');
                }
                return;
            }
            // 发送已读标记
            $.ajax({
                url: CONFIG.API.NOTIFICATION_MARK_READ,
                type: 'POST',
                data: JSON.stringify({
                    ids: [$item.data('id')]
                }),
                contentType: 'application/json',
                headers: {
                },
                // xhrFields: {
                //     withCredentials: true  // ✅ 携带 Cookie
                // },
                success: function(res) {
                    if (res.code === '1') {
                        $item.removeClass('unread').addClass('read');
                        updateNotificationBadge(res.data?.unread_count);
                    } else if(res.code === '401'){
                        window.location.href = './login.html';
                    }
                }
            });
        });

        // 全部标记已读
        container.find('#markAllNotificationsRead').off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const $btn = $(this);
            $btn.html('<i class="glyphicon glyphicon-refresh spinning"></i> 处理中...');

            $.ajax({
                url: CONFIG.API.NOTIFICATION_MARK_ALL_READ,
                type: 'POST',
                headers: {
                },
                success: function(res) {
                    if (res.code === '1') {
                        container.find('.notification-item.unread').removeClass('unread').addClass('read');
                        $btn.html('<i class="glyphicon glyphicon-check"></i> 全部已读');
                        updateNotificationBadge(0);

                        // 显示成功提示
                        if (window.notices) {
                            notices('✅ 已全部标记为已读', 'success');
                        }
                    } else if(res.code === '401'){
                        window.location.href = './login.html';
                    }
                },
                error: function() {
                    $btn.html('<i class="glyphicon glyphicon-check"></i> 全部已读');
                }
            });
        });

        // 加载更多
        container.find('#loadMoreNotifications').off('click').on('click', function(e) {
            e.preventDefault();
            const currentPage = container.data('currentPage') || 1;
            loadNotifications(container, currentPage + 1);
        });
    }

    /**
     * 绑定消息相关事件
     */
    function bindMessageEvents(container) {
        // 标记单条消息已读
        container.find('.message-item.unread a').off('click').on('click', function() {
            const $item = $(this).closest('.message-item');
            const messageId = $item.data('id');

            // ✅ 未登录时不操作
            if (!isAuthenticated()) {
                return;
            }

            $.ajax({
                url: messagesId_url + `${messageId}/`,
                type: 'GET',
                // xhrFields: {
                //     withCredentials: true
                // },
                headers: {
                }
            });
        });

        // 全部标记已读
        container.find('#markAllMessagesRead').off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated()) {
                return;
            }
            const $btn = $(this);
            $btn.html('<i class="glyphicon glyphicon-refresh spinning"></i> 处理中...');

            // 由于没有批量标记消息已读的API，这里模拟
            setTimeout(() => {
                container.find('.message-item.unread').removeClass('unread').addClass('read');
                $btn.html('<i class="glyphicon glyphicon-check"></i> 全部已读');
                updateMessageBadge(0);

                if (window.notices) {
                    notices('✅ 已全部标记为已读', 'success');
                }
            }, 500);
        });

        // 加载更多消息
        container.find('#loadMoreMessages').off('click').on('click', function(e) {
            e.preventDefault();
            const currentPage = container.data('currentPage') || 1;
            loadMessages(container, currentPage + 1);
        });
    }

    // ===== 徽章更新 =====

    /**
     * 更新通知徽章
     */
    function updateNotificationBadge(count) {
        const $badge = $('.notification-badge');
        if (count > 0) {
            $badge.text(count).show();

            // 添加动画
            $badge.addClass('badgePop');
            setTimeout(() => $badge.removeClass('badgePop'), 300);
        } else {
            $badge.hide();
        }
    }

    /**
     * 更新消息徽章
     */
    function updateMessageBadge(count) {
        const $badge = $('.message-badge');
        if (count > 0) {
            $badge.text(count).show();
            $badge.addClass('badgePop');
            setTimeout(() => $badge.removeClass('badgePop'), 300);
        } else {
            $badge.hide();
        }
    }

    /**
     * 加载所有未读数量
     */
    function loadUnreadCounts() {
        // ✅ 未登录时不请求
        if (!isAuthenticated()) {
            console.log('用户未登录，跳过未读数量请求');
            updateNotificationBadge(0);
            updateMessageBadge(0);
            return Promise.resolve({ code: '1', data: { notification: 0, message: 0 } });
        }

        return $.ajax({
            url: CONFIG.API.UNREAD_COUNT,
            type: 'GET',
            // xhrFields: {
            //     withCredentials: true  // ✅ 携带 Cookie
            // },
            success: function(res) {
                if (res.code === '1') {
                    updateNotificationBadge(res.data.notification);
                    updateMessageBadge(res.data.message);
                } else if(res.code === '401'){
                    window.location.href = './login.html';
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    // 未登录或会话过期
                    updateNotificationBadge(0);
                    updateMessageBadge(0);
                }
                console.error('获取未读数量失败:', xhr);
            }
        });
    }

    // ===== 公开API =====

    return {
        // 渲染
        renderNotificationMenu: renderNotificationMenu,
        renderMessageMenu: renderMessageMenu,

        // 加载
        loadNotifications: loadNotifications,
        loadMessages: loadMessages,
        loadUnreadCounts: loadUnreadCounts,

        // 徽章
        updateNotificationBadge: updateNotificationBadge,
        updateMessageBadge: updateMessageBadge,

        // 工具
        formatTimeAgo: formatTimeAgo,
        truncateText: truncateText
    };

})();

// 全局导出
window.NotificationRenderer = NotificationRenderer;