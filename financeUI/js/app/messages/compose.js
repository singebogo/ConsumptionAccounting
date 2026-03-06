$(function() {
    // ========== 0. 获取用户信息工具函数 ==========
    function getCurrentUser() {
        // 优先使用全局 UserInfo 模块
        if (window.UserInfo && window.UserInfo.getCurrentUser) {
            return window.UserInfo.getCurrentUser();
        }

        // 降级方案：直接读取存储
        try {
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (e) {
            const username = sessionStorage.getItem('user') || localStorage.getItem('rememberUsername');
            if (username) {
                return { username: username, isAuthenticated: true };
            }
        }
        return null;
    }

    function isAuthenticated() {
        if (window.UserInfo && window.UserInfo.isAuthenticated) {
            return window.UserInfo.isAuthenticated();
        }
        return !!getCurrentUser();
    }

    // ========== 1. 初始化富文本编辑器 ==========
    $('#summernote').summernote({
        height: 300,
        minHeight: 200,
        maxHeight: 500,
        lang: 'zh-CN',
        placeholder: '请输入消息内容...',
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ],
        callbacks: {
            onChange: function(contents) {
                $('#contentError').hide();
            }
        }
    });

    // ========== 2. 获取URL参数（回复消息） ==========
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const replyToId = getUrlParameter('reply_to');
    const recipientId = getUrlParameter('recipient');

    // ========== 3. 加载回复消息预览 ==========
    if (replyToId) {
        loadReplyMessage(replyToId);
    }

    // ========== 4. 如果指定了收件人，自动填充 ==========
    if (recipientId) {
        loadRecipientInfo(recipientId);
    }

    // ========== 5. 收件人搜索 ==========
    let searchTimer;
    $('#recipientSearch').on('input', function() {
        clearTimeout(searchTimer);
        const keyword = $(this).val().trim();

        if (keyword.length < 2) {
            $('#recipientDropdown').removeClass('show');
            return;
        }

        searchTimer = setTimeout(() => {
            searchUsers(keyword);
        }, 300);
    });

    // 点击其他地方关闭下拉框
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.recipient-input-group').length) {
            $('#recipientDropdown').removeClass('show');
        }
    });

    // ========== 6. 附件上传 ==========
    const attachments = [];

    $('#attachmentArea').on('click', function() {
        $('#fileInput').click();
    });

    // 拖拽上传
    $('#attachmentArea').on('dragover', function(e) {
        e.preventDefault();
        $(this).css({
            'border-color': '#3b82f6',
            'background': '#eff6ff'
        });
    });

    $('#attachmentArea').on('dragleave', function(e) {
        e.preventDefault();
        $(this).css({
            'border-color': '#e2e8f0',
            'background': '#f8fafc'
        });
    });

    $('#attachmentArea').on('drop', function(e) {
        e.preventDefault();
        $(this).css({
            'border-color': '#e2e8f0',
            'background': '#f8fafc'
        });

        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });

    $('#fileInput').on('change', function() {
        handleFiles(this.files);
        this.value = '';
    });

    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 文件大小限制（10MB）
            if (file.size > 10 * 1024 * 1024) {
                showAlert('文件 ' + file.name + ' 超过10MB限制', 'error');
                continue;
            }

            attachments.push(file);
            renderAttachment(file);
        }
    }

    function renderAttachment(file) {
        const fileSize = (file.size / 1024).toFixed(2) + ' KB';
        const fileExt = file.name.split('.').pop();
        let icon = 'glyphicon-file';

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            icon = 'glyphicon-picture';
        } else if (['pdf'].includes(fileExt)) {
            icon = 'glyphicon-file';
        } else if (['doc', 'docx'].includes(fileExt)) {
            icon = 'glyphicon-file';
        } else if (['xls', 'xlsx'].includes(fileExt)) {
            icon = 'glyphicon-stats';
        }

        const html = `
                    <div class="attachment-item" data-filename="${file.name}">
                        <div class="attachment-icon">
                            <i class="glyphicon ${icon}"></i>
                        </div>
                        <div class="attachment-info">
                            <div class="attachment-name">${file.name}</div>
                            <div class="attachment-size">${fileSize}</div>
                        </div>
                        <div class="attachment-remove" onclick="removeAttachment(this)">
                            <i class="glyphicon glyphicon-trash"></i>
                        </div>
                    </div>
                `;

        $('#attachmentList').append(html);
    }

    window.removeAttachment = function(element) {
        const $item = $(element).closest('.attachment-item');
        const filename = $item.data('filename');

        // 从数组中移除
        const index = attachments.findIndex(f => f.name === filename);
        if (index > -1) {
            attachments.splice(index, 1);
        }

        $item.remove();
    };

    // ========== 7. 表单提交 ==========
    $('#messageForm').on('submit', function(e) {
        e.preventDefault();

        // 验证
        if (!validateForm()) {
            return;
        }

        // 获取内容
        const content = $('#summernote').summernote('code');
        const subject = $('#subject').val().trim();
        const recipientId = $('#selectedRecipients .selected-recipient-tag').data('id');

        // 显示发送中状态
        const $btn = $('#sendBtn');
        $btn.html('<i class="glyphicon glyphicon-refresh spinning"></i> 发送中...')
            .attr('disabled', true);

        // 准备数据
        const formData = {
            recipient_id: recipientId,
            title: subject || '无主题',
            content: content,
            reply_to: replyToId
        };

        // 发送请求
        $.ajax({
            url: messagesSend_url,
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function(res) {
                if (res.code === '1') {
                    showAlert('发送成功', 'success');

                    // 3秒后返回收件箱
                    setTimeout(() => {
                        window.location.href = './inbox.html';
                    }, 2000);
                } else {
                    showAlert(res.msg || '发送失败', 'error');
                    $btn.html('<i class="glyphicon glyphicon-send"></i> 发送')
                        .attr('disabled', false);
                }
            },
            error: function(xhr) {
                let msg = '网络错误，请重试';
                if (xhr.responseJSON && xhr.responseJSON.msg) {
                    msg = xhr.responseJSON.msg;
                }
                showAlert(msg, 'error');
                $btn.html('<i class="glyphicon glyphicon-send"></i> 发送')
                    .attr('disabled', false);
            }
        });
    });

    // ========== 8. 表单验证 ==========
    function validateForm() {
        let isValid = true;

        // 验证收件人
        if ($('#selectedRecipients .selected-recipient-tag').length === 0) {
            $('#recipientError').text('请选择收件人').show();
            isValid = false;
        } else {
            $('#recipientError').hide();
        }

        // 验证内容
        const content = $('#summernote').summernote('code');
        if (!content || content === '<p><br></p>' || content === '') {
            $('#contentError').text('消息内容不能为空').show();
            isValid = false;
        } else {
            $('#contentError').hide();
        }

        return isValid;
    }

    // ========== 9. 取消按钮 ==========
    $('#cancelBtn').on('click', function() {
        if (confirm('确定取消编辑吗？未保存的内容将丢失。')) {
            window.history.back();
        }
    });

    // ========== 10. 保存草稿 ==========
    $('#saveDraftBtn').on('click', function() {
        showAlert('草稿功能开发中', 'warning');
    });

    // ========== 11. 通讯录 ==========
    $('#selectFromContacts').on('click', function() {
        $('#contactsModal').modal('show');
        loadContactList();
    });

    // ========== 12. 工具函数 ==========

    /**
     * 搜索用户
     */
    function searchUsers(keyword) {
        // TODO: 调用后端搜索API
        $.ajax({
            url: userSearch_url,
            type: 'GET',
            data: { keyword: keyword },
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function(res) {
                if (res.code === '1' && res.data.length > 0) {
                    renderUserDropdown(res.data);
                } else {
                    $('#recipientDropdown').html('<div class="recipient-item" style="justify-content: center;">未找到用户</div>')
                        .addClass('show');
                }
            }
        });
    }

    /**
     * 渲染用户下拉框
     */
    function renderUserDropdown(users) {
        let html = '';
        users.forEach(user => {
            const initial = user.username.charAt(0).toUpperCase();
            const color = getAvatarColor(user.username);

            html += `
                        <div class="recipient-item" data-id="${user.id}" data-username="${user.username}" data-email="${user.email}">
                            <div class="recipient-avatar" style="background: ${color};">${initial}</div>
                            <div class="recipient-info">
                                <div class="recipient-name">${user.username}</div>
                                <div class="recipient-email">${user.email || '暂无邮箱'}</div>
                            </div>
                            <span class="recipient-dept">${user.department || '用户'}</span>
                        </div>
                    `;
        });

        $('#recipientDropdown').html(html).addClass('show');

        // 绑定点击事件
        $('.recipient-item').on('click', function() {
            selectRecipient({
                id: $(this).data('id'),
                username: $(this).data('username'),
                email: $(this).data('email')
            });
        });
    }

    /**
     * 选择收件人
     */
    function selectRecipient(user) {
        $('#selectedRecipients').html(`
                    <div class="selected-recipient-tag" data-id="${user.id}">
                        <i class="glyphicon glyphicon-user"></i>
                        ${user.username}
                        <i class="glyphicon glyphicon-remove" onclick="removeRecipient()"></i>
                    </div>
                `);

        $('#recipientSearch').val(user.username);
        $('#recipientDropdown').removeClass('show');
    }

    window.removeRecipient = function() {
        $('#selectedRecipients').empty();
        $('#recipientSearch').val('');
    };

    /**
     * 加载收件人信息
     */
    function loadRecipientInfo(userId) {
        $.ajax({
            url: userId_url+`/${userId}/`,
            type: 'GET',
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function(res) {
                if (res.code === '1') {
                    selectRecipient(res.data);
                }
            }
        });
    }

    /**
     * 加载回复消息
     */
    function loadReplyMessage(messageId) {
        $.ajax({
            url: AuthloginMessagesId_url + `/${messageId}/`,
            type: 'GET',
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function(res) {
                if (res.code === '1') {
                    const msg = res.data;

                    const html = `
                                <div class="reply-preview">
                                    <div class="reply-preview-header">
                                        <span class="reply-preview-title">
                                            <i class="glyphicon glyphicon-share-alt"></i>
                                            回复: ${msg.sender_name}
                                        </span>
                                        <span class="reply-preview-close" onclick="$('.reply-preview').remove()">
                                            <i class="glyphicon glyphicon-remove"></i>
                                        </span>
                                    </div>
                                    <div class="reply-preview-content">
                                        ${msg.content}
                                    </div>
                                    <div class="reply-preview-meta">
                                        <i class="glyphicon glyphicon-time"></i> ${msg.time_ago}
                                        &nbsp;&nbsp;
                                        <i class="glyphicon glyphicon-envelope"></i> ${msg.title}
                                    </div>
                                </div>
                            `;

                    $('#replyPreview').html(html).show();

                    // 自动填充收件人
                    if (!recipientId) {
                        selectRecipient({
                            id: msg.sender,
                            username: msg.sender_name
                        });
                    }

                    // 添加回复前缀
                    $('#subject').val(`回复: ${msg.title || '无主题'}`);
                }
            }
        });
    }

    /**
     * 加载联系人列表
     */
    function loadContactList() {
        // 1. 先检查用户是否已登录
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.log('用户未登录，无法加载通讯录');
            window.location.href = '../../login.html';  // 根据实际路径调整
            return;
        }

        // 2. 显示加载状态
        $('#contactList').html(`
        <div style="text-align: center; padding: 40px; color: #64748b;">
            <i class="glyphicon glyphicon-refresh spinning" style="font-size: 32px;"></i>
            <p style="margin-top: 16px;">加载通讯录中...</p>
        </div>
    `);

        $.ajax({
            url: notificationUsers_url,  // ✅ 使用 notification app 的 API
            type: 'GET',
            data: {
                page_size: 50,
                _t: Date.now()  // 避免缓存
            },
            // xhrFields: {
            //     withCredentials: true  // ✅ 携带 Cookie
            // },
            success: function(res) {
                // Django 返回的已经是 JSON 对象
                if (res && res.code === '1') {
                    if (res.data && res.data.list && res.data.list.length > 0) {
                        renderContactList(res.data.list);
                    } else {
                        // 空列表
                        renderContactList([]);
                        showAlert('暂无联系人', 'info');
                    }
                } else {
                    console.error('获取用户列表失败:', res?.msg || '未知错误');
                    renderContactList([]);
                    showAlert(res?.msg || '加载通讯录失败', 'error');
                }
            },
            error: function(xhr) {
                console.error('请求用户列表失败:', xhr.status, xhr.statusText);

                // 解析错误响应
                try {
                    const res = JSON.parse(xhr.responseText);

                    // 处理 401 未授权
                    if (xhr.status === 401 || res?.code === '401') {
                        console.log('登录已过期，跳转到登录页');

                        // 清除本地存储
                        sessionStorage.removeItem('user');
                        localStorage.removeItem('user');
                        localStorage.removeItem('rememberUsername');

                        // 跳转到登录页
                        window.location.href = '../../login.html';
                        return;
                    }

                    // 其他错误
                    renderContactList([]);
                    showAlert(res?.msg || '加载通讯录失败', 'error');

                } catch (e) {
                    // 非 JSON 响应
                    if (xhr.status === 401) {
                        window.location.href = '../../login.html';
                    } else {
                        renderContactList([]);
                        showAlert('网络错误，请稍后重试', 'error');
                    }
                }
            },
            complete: function() {
                // 移除加载状态（如果需要）
            }
        });
    }

    /**
     * 渲染联系人列表
     */
    function renderContactList(users) {
        if (!users || users.length === 0) {
            $('#contactList').html(`
            <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                <i class="glyphicon glyphicon-user" style="font-size: 48px; opacity: 0.5;"></i>
                <p style="margin-top: 16px; font-size: 14px;">暂无联系人</p>
                <p style="font-size: 12px; margin-top: 8px;">系统会自动同步所有活跃用户</p>
            </div>
        `);
            return;
        }

        let html = '<div class="list-group" style="max-height: 400px; overflow-y: auto;">';

        // 按用户名首字母分组
        const groupedUsers = {};
        users.forEach(user => {
            const firstLetter = (user.username || 'A').charAt(0).toUpperCase();
            if (!groupedUsers[firstLetter]) {
                groupedUsers[firstLetter] = [];
            }
            groupedUsers[firstLetter].push(user);
        });

        // 按字母顺序排序
        Object.keys(groupedUsers).sort().forEach(letter => {
            html += `<div style="background: #f8fafc; padding: 5px 15px; font-weight: 600; color: #3b82f6;">${letter}</div>`;

            groupedUsers[letter].forEach(user => {
                const avatarColor = getAvatarColor(user.username);
                const initial = user.username.charAt(0).toUpperCase();
                const displayName = user.full_name || user.username;
                const department = user.department || (user.id % 2 === 0 ? '财务部' : '技术部');

                html += `
                <a href="javascript:void(0);" class="list-group-item" style="display: flex; align-items: center; padding: 12px 15px; border-left: none; border-right: none;"
                   onclick="selectFromContact(${user.id}, '${user.username}')">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: ${avatarColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">
                        ${initial}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #0f172a;">${displayName}</div>
                        <div style="display: flex; gap: 10px; margin-top: 4px;">
                            <span style="font-size: 12px; color: #64748b;">
                                <i class="glyphicon glyphicon-envelope" style="margin-right: 4px;"></i>
                                ${user.email || '暂无邮箱'}
                            </span>
                            <span style="font-size: 12px; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; color: #475569;">
                                ${department}
                            </span>
                        </div>
                    </div>
                    <i class="glyphicon glyphicon-chevron-right" style="color: #94a3b8;"></i>
                </a>
            `;
            });
        });

        html += '</div>';
        $('#contactList').html(html);
    }


    /**
     * 从通讯录选择联系人
     */
    window.selectFromContact = function(userId, username) {
        selectRecipient({
            id: userId,
            username: username
        });
        $('#contactsModal').modal('hide');
        showAlert(`已选择收件人: ${username}`, 'success');
    }

    /**
     * 获取头像颜色
     */
    function getAvatarColor(name) {
        if (!name) return '#3b82f6';
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * 显示提示消息
     */
    function showAlert(msg, type = 'info') {
        if (window.notices) {
            window.notices(msg, type);
            return;
        }

        // 降级方案
        const alertHtml = `
        <div class="alert-message alert-${type}" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
            <i class="glyphicon glyphicon-${type === 'success' ? 'ok-sign' : type === 'error' ? 'exclamation-sign' : 'info-sign'}"></i>
            <span>${msg}</span>
        </div>
    `;

        $('body').append(alertHtml);
        setTimeout(() => {
            $('.alert-message').fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    // 添加旋转动画
    const style = document.createElement('style');
    style.textContent = `
                .spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
    document.head.appendChild(style);
});