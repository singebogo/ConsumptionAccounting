/**
 * 消息详情渲染器
 */
let MessageDetailRenderer = (function() {

    // ===== 新增：发送消息函数 =====
    function sendMessage(data) {
        if (!isAuthenticated()) {
            return Promise.reject('请先登录');
        }

        return $.ajax({
            url: CONFIG.API.MESSAGE_SEND,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            // xhrFields: {
            //     withCredentials: true
            // }
        });
    }

    /**
     * 渲染消息详情
     */
    function renderMessageDetail(container, messageId) {
        if (!container) return;
        // ✅ 未登录时不操作
        if (!isAuthenticated()) {
            return;
        }
        // 显示加载中
        container.html(`
            <div class="message-detail-loading">
                <i class="glyphicon glyphicon-refresh spinning"></i>
                <p>加载中...</p>
            </div>
        `);

        $.ajax({
            url: messagesId_url + `${messageId}/`,
            type: 'GET',
            headers: {
            },
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function(res) {
                if (res.code === '1') {
                    renderDetailContent(container, res.data);
                } else {
                    container.html(`
                        <div class="message-detail-error">
                            <i class="glyphicon glyphicon-exclamation-sign"></i>
                            <p>${res.msg || '加载失败'}</p>
                        </div>
                    `);
                }
            },
            error: function() {
                container.html(`
                    <div class="message-detail-error">
                        <i class="glyphicon glyphicon-remove-circle"></i>
                        <p>网络错误，请稍后重试</p>
                    </div>
                `);
            }
        });
    }

    /**
     * 渲染详情内容
     */
    function renderDetailContent(container, message) {
        const timeAgo = NotificationRenderer.formatTimeAgo(message.sent_at);
        const senderInitial = message.sender_name ? message.sender_name.charAt(0).toUpperCase() : 'S';
        const avatarColor = getAvatarColor(message.sender_name);

        let html = `
            <div class="message-detail-header">
                <div class="message-detail-sender">
                    <div class="sender-avatar-large" style="background: ${avatarColor};">
                        ${senderInitial}
                    </div>
                    <div class="sender-info">
                        <h3>${message.sender_name || '系统消息'}</h3>
                        <div class="sender-meta">
                            <span><i class="glyphicon glyphicon-time"></i> ${timeAgo}</span>
                            <span><i class="glyphicon glyphicon-envelope"></i> 发给: ${message.recipient_name || '我'}</span>
                        </div>
                    </div>
                </div>
                <div class="message-detail-actions">
                    <button class="btn-reply">
                        <i class="glyphicon glyphicon-share-alt"></i> 回复
                    </button>
                    <button class="btn-star ${message.is_starred ? 'active' : ''}">
                        <i class="glyphicon glyphicon-star${message.is_starred ? '' : '-empty'}"></i>
                    </button>
                    <button class="btn-delete">
                        <i class="glyphicon glyphicon-trash"></i>
                    </button>
                </div>
            </div>
            <div class="message-detail-body">
                <h2 class="message-detail-title">${message.title || '无标题'}</h2>
                <div class="message-detail-content">
                    ${message.content.replace(/\n/g, '<br>')}
                </div>
        `;

        // 附件
        if (message.attachment) {
            html += `
                <div class="message-attachments">
                    <div class="attachment-header">
                        <i class="glyphicon glyphicon-paperclip"></i>
                        附件 (1个)
                    </div>
                    <div class="attachment-item">
                        <i class="glyphicon glyphicon-file"></i>
                        <span class="attachment-name">${message.attachment_name || '附件文件'}</span>
                        <span class="attachment-size">${message.attachment_size || '--'}</span>
                        <a href="${message.attachment}" download class="attachment-download">
                            <i class="glyphicon glyphicon-download-alt"></i> 下载
                        </a>
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        container.html(html);

        // 绑定事件
        bindDetailEvents(container, message);
    }

    /**
     * 绑定详情页事件
     */
    function bindDetailEvents(container, message) {

        // 回复
        container.find('.btn-reply').on('click', function() {
            window.location.href = `./compose.html?reply_to=${message.id}&recipient=${message.sender}`;
        });
        // ✅ 未登录时不操作
        if (!isAuthenticated()) {
            return;
        }
        // 标星
        container.find('.btn-star').on('click', function() {
            const $btn = $(this);
            const isStarred = $btn.hasClass('active');

            $.ajax({
                url: notificationMessagesStar_url,
                type: 'POST',
                data: JSON.stringify({
                    id: message.id,
                    starred: !isStarred
                }),
                contentType: 'application/json',
                headers: {
                },
                // xhrFields: {
                //     withCredentials: true
                // },
                success: function(res) {
                    if (res.code === '1') {
                        if (!isStarred) {
                            $btn.addClass('active');
                            $btn.find('i').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                        } else {
                            $btn.removeClass('active');
                            $btn.find('i').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
                        }
                    }
                }
            });
        });

        // 删除
        container.find('.btn-delete').on('click', function() {
            // ✅ 未登录时不操作
            if (!isAuthenticated()) {
                return;
            }
            if (confirm('确定要删除这条消息吗？')) {
                $.ajax({
                    url: notificationMessagesDelete_url,
                    type: 'POST',
                    // xhrFields: {
                    //     withCredentials: true
                    // },
                    data: JSON.stringify({
                        ids: [message.id]
                    }),
                    contentType: 'application/json',
                    headers: {
                    },
                    success: function(res) {
                        if (res.code === '1') {
                            window.location.href = './inbox.html';
                        }
                    }
                });
            }
        });
    }

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

    return {
        render: renderMessageDetail
    };

})();

window.MessageDetailRenderer = MessageDetailRenderer;