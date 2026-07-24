/**
 * 用户管理模块
 * 支持内置角色（管理员、工作人员、游客）和自定义角色组
 */

 $(function() {

    // ===== 配置 =====
    const API = {
        USER_LIST: USER_API.LIST,
        USER_DETAIL: USER_API.DETAIL,
        USER_CREATE: USER_API.CREATE,
        USER_UPDATE: USER_API.UPDATE,
        USER_DELETE: USER_API.DELETE,
        USER_RESET_PASSWORD: USER_API.RESET_PASSWORD,
        ROLE_LIST: '/Authlogin/api/roles/all/',  // 获取所有角色组
    };

    let currentPage = 1;
    let pageSize = 10;
    let totalUsers = 0;
    let deleteUserId = null;
    let currentKeyword = '';
    let currentStatus = '';
    let currentRole = '';
    let allGroups = [];  // 存储所有自定义角色组
    let isInitialized = false;

    // ===== 获取当前用户名 =====
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

    // ===== 工具函数 =====

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

    function getAvatarColor(name) {
        if (!name) return '#6c5ce7';
        const colors = ['#6c5ce7', '#00b894', '#0984e3', '#e17055', '#fdcb6e', '#fd79a8', '#00cec9', '#a29bfe'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    function getInitial(name) {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    }

    function getStatusBadge(isActive) {
        if (isActive) {
            return '<span class="user-status-badge user-status-active">● 已激活</span>';
        }
        return '<span class="user-status-badge user-status-inactive">● 未激活</span>';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ===== 角色相关函数 =====

    /**
     * 内置角色定义
     */
    const BUILTIN_ROLES = [
        { id: 'admin', name: '管理员', icon: 'glyphicon-star', description: '拥有系统所有权限' },
        { id: 'staff', name: '工作人员', icon: 'glyphicon-briefcase', description: '拥有后台管理权限' },
        { id: 'guest', name: '游客', icon: 'glyphicon-user', description: '普通用户，仅可查看公开内容' }
    ];

    /**
     * 获取用户显示的角色名称
     */
    function getUserRoleDisplay(user) {
        // 检查是否为内置角色
        if (user.is_superuser) {
            return '管理员';
        }
        if (user.is_staff) {
            return '工作人员';
        }
        // 检查是否有自定义角色组
        if (user.groups && user.groups.length > 0) {
            return user.groups.join(', ');
        }
        return '游客';
    }

    /**
     * 获取用户角色值（用于表单选择）
     * 优先级：is_superuser > is_staff > groups > guest
     */
    function getUserRoleValue(user) {
        // ✅ 1. 如果是超级管理员
        if (user.is_superuser) {
            return 'admin';
        }
        // ✅ 2. 如果是工作人员
        if (user.is_staff) {
            return 'staff';
        }
        // ✅ 3. 如果有自定义角色组
        if (user.group_ids && user.group_ids.length > 0) {
            // 如果用户有多个组，使用第一个组
            return 'group_' + user.group_ids[0];
        }
        // ✅ 4. 默认游客
        return 'guest';
    }

    /**
     * 获取用户当前的组显示文本
     */
    function getUserGroupsDisplay(user) {
        if (user.groups && user.groups.length > 0) {
            return user.groups.join('、');
        }
        return '未分配';
    }

    /**
     * 获取角色标签（用于表格显示）
     */
    function getRoleBadge(user) {
        let roleName = '游客';
        let badgeClass = 'user-role-user';
        let icon = '';

        if (user.is_superuser) {
            roleName = '管理员';
            badgeClass = 'user-role-admin';
            icon = '<i class="glyphicon glyphicon-star" style="margin-right: 3px;"></i>';
        } else if (user.is_staff) {
            roleName = '工作人员';
            badgeClass = 'user-role-manager';
            icon = '<i class="glyphicon glyphicon-briefcase" style="margin-right: 3px;"></i>';
        } else if (user.groups && user.groups.length > 0) {
            roleName = user.groups[0];
            badgeClass = 'user-role-user';
        }

        return `<span class="user-role-badge ${badgeClass}">${icon}${roleName}</span>`;
    }

    /**
     * 加载所有自定义角色组
     */
    function loadAllGroups() {
        return $.ajax({
            url: API.ROLE_LIST,
            type: 'GET',
            data: { username: username },
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    allGroups = res.data || [];
                    populateRoleSelect();
                } else {
                    console.warn('加载角色组失败:', res.msg);
                }
            },
            error: function() {
                console.warn('加载角色组网络错误');
            }
        });
    }

    /**
     * 填充角色下拉框
     * @param {string} selectedValue - 当前选中的值
     */
    function populateRoleSelect(selectedValue) {
        const $select = $('#formRole');
        
        // 清空下拉框
        $select.empty();

        // ===== 1. 添加"无角色"选项 =====
        $select.append('<option value="">-- 无角色 --</option>');

        // ===== 2. 添加分隔线（内置角色） =====
        $select.append('<optgroup label="━━━ 内置角色 ━━━">');
        
        // 添加内置角色
        BUILTIN_ROLES.forEach(role => {
            const selected = (selectedValue === role.id) ? 'selected' : '';
            // 显示图标
            const iconMap = {
                'admin': '⭐ ',
                'staff': '💼 ',
                'guest': '👤 '
            };
            $select.append(`<option value="${role.id}" ${selected}>${iconMap[role.id] || ''}${role.name}</option>`);
        });
        $select.append('</optgroup>');

        // ===== 3. 添加分隔线（自定义角色组） =====
        if (allGroups.length > 0) {
            $select.append('<optgroup label="━━━ 自定义角色组 ━━━">');
            
            allGroups.forEach(group => {
                const value = 'group_' + group.id;
                const selected = (selectedValue === value) ? 'selected' : '';
                const count = group.user_count || 0;
                // 检查用户是否已分配此组（用于显示标记）
                const isAssigned = selected ? ' ✓' : '';
                $select.append(`<option value="${value}" ${selected}>${group.name} (${count}人)${isAssigned}</option>`);
            });
            $select.append('</optgroup>');
        } else {
            $select.append('<optgroup label="━━━ 自定义角色组 ━━━">');
            $select.append('<option value="" disabled>暂无自定义角色组</option>');
            $select.append('</optgroup>');
        }

        // 如果选中值存在但未在下拉框中，尝试设置
        if (selectedValue) {
            $select.val(selectedValue);
        }
    }

    // ===== 加载用户列表 =====

    function loadUsers(page = 1, keyword = '', status = '', role = '') {
        currentKeyword = keyword;
        currentStatus = status;
        currentRole = role;
        
        $('#userTableBody').html(`
            <tr>
                <td colspan="8" class="text-center">
                    <i class="glyphicon glyphicon-refresh spinning"></i> 加载中...
                </td>
            </tr>
        `);

        $.ajax({
            url: API.USER_LIST,
            type: 'GET',
            data: {
                page: page,
                page_size: pageSize,
                keyword: keyword,
                status: status,
                username: username,
                role: role
            },
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    renderUsers(res.data.list, res.data);
                    renderPagination(res.data);
                    updateStats(res.data.stats);
                    currentPage = page;
                    totalUsers = res.data.total;
                } else if (res.code === '401') {
                    window.top.location.href = '../../login.html';
                } else {
                    showNotice(res.msg || '加载失败', 'error');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401 || xhr.status === 403) {
                    window.top.location.href = '../../login.html';
                } else {
                    showNotice('网络错误，请重试', 'error');
                }
            }
        });
    }

    // ===== 渲染用户列表 =====

    function renderUsers(users, data) {
        const $tbody = $('#userTableBody');
        
        if (!users || users.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <i class="glyphicon glyphicon-user"></i>
                            <p>暂无用户数据</p>
                            <small class="text-muted">点击 "新增用户" 添加第一个用户</small>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        let html = '';
        users.forEach((user, index) => {
            const avatarColor = getAvatarColor(user.username);
            const initial = getInitial(user.username);
            const startIndex = (currentPage - 1) * pageSize + index + 1;

            html += `
                <tr>
                    <td>${startIndex}</td>
                    <td>
                        <div class="user-avatar-circle" style="background: ${avatarColor};">
                            ${initial}
                        </div>
                    </td>
                    <td>
                        <strong>${escapeHtml(user.username)}</strong>
                        ${user.is_superuser ? '<span class="text-warning"><i class="glyphicon glyphicon-star"></i></span>' : ''}
                    </td>
                    <td>${escapeHtml(user.email || '-')}</td>
                    <td>${getRoleBadge(user)}</td>
                    <td>${getStatusBadge(user.is_active)}</td>
                    <td>${formatDate(user.last_login)}</td>
                    <td>
                        <button class="table-action-btn btn-edit" onclick="editUser('${user.id}')" title="编辑">
                            <i class="glyphicon glyphicon-pencil"></i>
                        </button>
                        <button class="table-action-btn btn-reset" onclick="resetPassword('${user.id}')" title="重置密码">
                            <i class="glyphicon glyphicon-lock"></i>
                        </button>
                        <button class="table-action-btn btn-delete" onclick="confirmDelete('${user.id}', '${escapeHtml(user.username)}')" title="删除">
                            <i class="glyphicon glyphicon-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        $tbody.html(html);
        if (data) {
            $('#tableInfo').text(`共 ${data.total || 0} 条记录，第 ${data.page || 1}/${Math.ceil((data.total || 0) / pageSize)} 页`);
        }
    }

    // ===== 渲染分页 =====

    function renderPagination(data) {
        const $pagination = $('#pagination');
        const total = data.total || 0;
        const totalPages = Math.ceil(total / pageSize);
        const current = data.page || 1;

        if (totalPages <= 1) {
            $pagination.html('');
            return;
        }

        let html = '';
        html += `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="goToPage(${current - 1})">&laquo;</a>
            </li>
        `;

        let startPage = Math.max(1, current - 2);
        let endPage = Math.min(totalPages, current + 2);

        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="goToPage(1)">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === current ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" onclick="goToPage(${i})">${i}</a>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
            }
            html += `
                <li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="goToPage(${totalPages})">${totalPages}</a></li>
            `;
        }

        html += `
            <li class="page-item ${current >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="goToPage(${current + 1})">&raquo;</a>
            </li>
        `;

        $pagination.html(html);
    }

    // ===== 更新统计 =====

    function updateStats(stats) {
        if (!stats) return;
        $('#totalUsers').text(stats.total || 0);
        $('#activeUsers').text(stats.active || 0);
        $('#inactiveUsers').text(stats.inactive || 0);
        $('#adminUsers').text(stats.admin || 0);
    }

    // ===== 页面跳转 =====

    window.goToPage = function(page) {
        if (page < 1) return;
        const keyword = $('#searchKeyword').val().trim();
        const status = $('#filterStatus').val();
        const role = $('#filterRole').val();
        loadUsers(page, keyword, status, role);
    };

    // ===== 搜索 =====

    $('#searchBtn').on('click', function() {
        const keyword = $('#searchKeyword').val().trim();
        const status = $('#filterStatus').val();
        const role = $('#filterRole').val();
        loadUsers(1, keyword, status, role);
    });

    $('#resetBtn').on('click', function() {
        $('#searchKeyword').val('');
        $('#filterStatus').val('');
        $('#filterRole').val('');
        loadUsers(1);
    });

    $('#searchKeyword').on('keypress', function(e) {
        if (e.which === 13) {
            $('#searchBtn').click();
        }
    });

    // ===== 新增用户 =====

    $('#addUserBtn').on('click', function() {
        $('#userModalTitle').html('<i class="glyphicon glyphicon-plus"></i> 新增用户');
        $('#editUserId').val('');
        $('#userForm')[0].reset();
        $('#passwordGroup').show();
        $('#formPassword').prop('required', true);
        $('#formPassword').val('');
        // 默认选择游客
        populateRoleSelect('guest');
        $('#formStatus').val('1');
        // 显示当前角色信息
        $('#currentRoleDisplay').text('游客').show();
        $('#userModal').modal('show');
    });

    // ===== 编辑用户 =====

    window.editUser = function(userId) {
        $.ajax({
            url: API.USER_DETAIL + userId + '/',
            type: 'GET',
            data: { username: username },
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    const user = res.data;
                    $('#userModalTitle').html('<i class="glyphicon glyphicon-pencil"></i> 编辑用户');
                    $('#editUserId').val(user.id);
                    $('#formUsername').val(user.username || '');
                    $('#formEmail').val(user.email || '');
                    
                    // ✅ 获取用户角色值并设置
                    const roleValue = getUserRoleValue(user);
                    
                    // ✅ 显示当前角色信息
                    const roleDisplay = getUserRoleDisplay(user);
                    const groupsDisplay = getUserGroupsDisplay(user);
                    
                    // 在下拉框上方显示当前角色信息
                    $('#currentRoleDisplay').html(`
                        <span class="label label-info" style="display:inline-block;padding:4px 12px;background:#e8f4fd;border-radius:4px;color:#0066cc;">
                            <i class="glyphicon glyphicon-info-sign"></i> 
                            当前角色: <strong>${roleDisplay}</strong>
                            ${groupsDisplay !== '未分配' ? ` | 所属组: <strong>${groupsDisplay}</strong>` : ''}
                        </span>
                    `).show();
                    
                    // ✅ 填充下拉框并选中当前角色
                    populateRoleSelect(roleValue);
                    
                    $('#formStatus').val(user.is_active ? '1' : '0');
                    $('#passwordGroup').hide();
                    $('#formPassword').prop('required', false);
                    $('#formPassword').val('');
                    $('#userModal').modal('show');
                } else {
                    showNotice(res.msg || '获取用户信息失败', 'error');
                }
            },
            error: function() {
                showNotice('获取用户信息失败', 'error');
            }
        });
    };

    // ===== 保存用户 =====

    $('#saveUserBtn').on('click', function() {
        const userId = $('#editUserId').val();
        const usernameVal = $('#formUsername').val().trim();
        const email = $('#formEmail').val().trim();
        const password = $('#formPassword').val();
        const roleVal = $('#formRole').val();
        const status = $('#formStatus').val();

        // 表单验证
        if (!usernameVal) {
            showNotice('请输入用户名', 'error');
            $('#formUsername').focus();
            return;
        }
        if (!email) {
            showNotice('请输入邮箱', 'error');
            $('#formEmail').focus();
            return;
        }
        if (!isValidEmail(email)) {
            showNotice('请输入有效的邮箱地址', 'error');
            $('#formEmail').focus();
            return;
        }
        if (!userId && !password) {
            showNotice('新增用户请设置密码', 'error');
            $('#formPassword').focus();
            return;
        }
        if (password && password.length < 8) {
            showNotice('密码至少8位', 'error');
            $('#formPassword').focus();
            return;
        }

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> 保存中...');

        // ✅ 构建数据
        const data = {
            username: usernameVal,
            email: email,
            is_active: status === '1',
            username_param: username
        };
        
        if (password) {
            data.password = password;
        }
        if (userId) {
            data.id = parseInt(userId);
        }

        // ✅ 处理角色选择
        if (roleVal === 'admin') {
            // 内置管理员
            data.role = 'admin';
            data.group_ids = [];
        } else if (roleVal === 'staff') {
            // 内置工作人员
            data.role = 'staff';
            data.group_ids = [];
        } else if (roleVal === 'guest') {
            // 内置游客
            data.role = 'user';
            data.group_ids = [];
        } else if (roleVal && roleVal.startsWith('group_')) {
            // 自定义角色组
            const groupId = parseInt(roleVal.replace('group_', ''));
            data.role = 'user';
            data.group_ids = [groupId];
        } else {
            // 无角色
            data.role = 'user';
            data.group_ids = [];
        }

        const url = userId ? API.USER_UPDATE : API.USER_CREATE;

        console.log('📤 发送数据:', data);

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    $('#userModal').modal('hide');
                    showNotice(res.msg || '保存成功', 'success');
                    loadUsers(currentPage, currentKeyword, currentStatus, currentRole);
                } else {
                    showNotice(res.msg || '保存失败', 'error');
                }
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存');
            },
            error: function(xhr) {
                let msg = '网络错误，请重试';
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.msg) msg = res.msg;
                } catch (e) {}
                showNotice(msg, 'error');
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存');
            }
        });
    });

    // ===== 重置密码 =====

    window.resetPassword = function(userId) {
        if (!confirm('确定要重置该用户的密码吗？新密码将随机生成。')) return;

        const $btn = $('.table-action-btn.btn-reset[onclick*="' + userId + '"]');
        $btn.html('<i class="glyphicon glyphicon-refresh spinning"></i>');

        $.ajax({
            url: API.USER_RESET_PASSWORD,
            type: 'POST',
            data: JSON.stringify({ id: userId, username: username }),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    showNotice(res.msg || '密码重置成功，请通知用户查收邮件', 'success');
                } else {
                    showNotice(res.msg || '重置失败', 'error');
                }
                $btn.html('<i class="glyphicon glyphicon-lock"></i>');
            },
            error: function() {
                showNotice('网络错误，请重试', 'error');
                $btn.html('<i class="glyphicon glyphicon-lock"></i>');
            }
        });
    };

    // ===== 删除用户 =====

    window.confirmDelete = function(userId, usernameVal) {
        deleteUserId = userId;
        $('#deleteUserName').text(usernameVal);
        $('#deleteModal').modal('show');
    };

    $('#confirmDeleteBtn').on('click', function() {
        if (!deleteUserId) return;

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> 删除中...');

        $.ajax({
            url: API.USER_DELETE,
            type: 'POST',
            data: JSON.stringify({ id: deleteUserId, username: username }),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    $('#deleteModal').modal('hide');
                    showNotice(res.msg || '删除成功', 'success');
                    loadUsers(currentPage, currentKeyword, currentStatus, currentRole);
                } else {
                    showNotice(res.msg || '删除失败', 'error');
                }
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-trash"></i> 确认删除');
                deleteUserId = null;
            },
            error: function() {
                showNotice('网络错误，请重试', 'error');
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-trash"></i> 确认删除');
            }
        });
    });

    // ===== 刷新 =====

    $('#refreshBtn').on('click', function() {
        const $btn = $(this);
        $btn.find('i').addClass('spinning');
        loadUsers(currentPage, currentKeyword, currentStatus, currentRole);
        setTimeout(() => {
            $btn.find('i').removeClass('spinning');
        }, 500);
    });

    // ===== 模态框关闭时重置 =====
    $('#userModal').on('hidden.bs.modal', function() {
        // 隐藏角色显示信息
        $('#currentRoleDisplay').hide();
    });

    // ===== 提示消息 =====

    function showNotice(msg, type) {
        if (typeof notices === 'function') {
            notices(msg, type);
        } else {
            const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
            const $alert = $('<div class="alert ' + alertClass + ' alert-dismissible fade show" style="position:fixed;top:20px;right:20px;z-index:9999;min-width:300px;">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                msg +
                '</div>');
            $('body').append($alert);
            setTimeout(function() {
                $alert.alert('close');
            }, 3000);
        }
    }

    // ===== 初始化 =====

    // 先加载角色组，再加载用户列表
    loadAllGroups().then(function() {
        loadUsers(1);
    }).fail(function() {
        // 即使加载角色组失败，也加载用户列表
        populateRoleSelect();
        loadUsers(1);
    });
});