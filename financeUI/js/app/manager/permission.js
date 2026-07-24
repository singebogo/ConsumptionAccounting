/**
 * 权限管理模块
 */

 $(function() {

    // ===== API 配置 =====
    const API = {
        ROLES: ROLE_API.ROLES,
        ROLE_CREATE: ROLE_API.ROLE_CREATE,
        ROLE_UPDATE: ROLE_API.ROLE_UPDATE,
        ROLE_DELETE: ROLE_API.ROLE_DELETE,
        PERMISSIONS: ROLE_API.PERMISSIONS,
        USER_MENUS: ROLE_API.USER_MENUS,
    };

    let currentRoleId = null;
    let allPermissions = [];
    let rolePermissions = {};
    let deleteRoleId = null;


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

    // ===== 加载角色列表 =====

    function loadRoles() {
        // ✅ 先检查用户是否登录
        if (!isAuthenticated()) {
            showNotice('请先登录', 'error');
            // ✅ 不跳转，显示无权限
            renderNoPermission();
            return;
        }
        
        // ✅ 检查是否是管理员
        if (!isAdmin()) {
            showNotice('需要管理员权限', 'error');
            renderNoPermission();
            return;
        }
        
        $('#roleList').html(`
            <div class="text-center text-muted" style="padding: 40px 0;">
                <i class="glyphicon glyphicon-refresh spinning"></i> 加载中...
            </div>
        `);

        $.ajax({
            url: API.ROLES,
            type: 'GET',
            data: {
                username: username  // ✅ 传递用户名
            },
            xhrFields: { 
                withCredentials: true
            },
            success: function(res) {
                console.log('角色列表响应:', res);
                if (res.code === '1') {
                    renderRoles(res.data);
                    updateStats(res.data);
                } else if (res.code === '401') {
                    showNotice('请先登录', 'error');
                    renderNoPermission();
                    // ✅ 不跳转
                } else if (res.code === '403') {
                    showNotice('无权限访问，请联系管理员', 'error');
                    renderNoPermission();
                } else {
                    showNotice(res.msg || '加载失败', 'error');
                }
            },
            error: function(xhr) {
                console.error('加载角色失败:', xhr.status);
                if (xhr.status === 401 || xhr.status === 403) {
                    showNotice('认证失败，请重新登录', 'error');
                    renderNoPermission();
                    // ✅ 不跳转
                } else {
                    showNotice('网络错误，请重试', 'error');
                }
            }
        });
    }

    // ✅ 检查用户是否已认证
    function isAuthenticated() {
        const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            return user && user.username;
        } catch (e) {
            return false;
        }
    }

    // ✅ 检查用户是否是管理员
    function isAdmin() {
        const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            return user.role === '管理员' || user.is_superuser === true || user.isAdmin === true;
        } catch (e) {
            return false;
        }
    }

    // ✅ 渲染无权限页面
    function renderNoPermission() {
        $('#roleList').html(`
            <div class="text-center text-muted" style="padding: 60px 0;">
                <i class="glyphicon glyphicon-ban-circle" style="font-size: 48px; color: #dc3545;"></i>
                <p style="margin-top: 16px; font-size: 16px;">暂无权限访问</p>
                <small class="text-muted">请联系管理员获取权限</small>
            </div>
        `);
        
        $('#permissionTree').html(`
            <div class="text-center text-muted" style="padding: 60px 0;">
                <i class="glyphicon glyphicon-lock" style="font-size: 48px; color: #6c757d;"></i>
                <p style="margin-top: 16px;">需要管理员权限</p>
            </div>
        `);
        
        // 隐藏操作按钮
        $('#addRoleBtn, #savePermissionBtn, #selectAllBtn, #deselectAllBtn').hide();
    }

    function renderRoles(roles) {
        const $container = $('#roleList');
        
        if (!roles || roles.length === 0) {
            $container.html(`
                <div class="text-center text-muted" style="padding: 40px 0;">
                    <i class="glyphicon glyphicon-user" style="font-size: 32px;"></i>
                    <p style="margin-top: 12px;">暂无角色</p>
                    <small>点击 "新增" 创建第一个角色</small>
                </div>
            `);
            return;
        }

        let html = '';
        roles.forEach(role => {
            const isActive = currentRoleId === role.id;
            const userCount = role.user_count || 0;
            
            html += `
                <div class="card role-card ${isActive ? 'active' : ''}" 
                     data-role-id="${role.id}" onclick="selectRole(${role.id})">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>
                            <i class="glyphicon glyphicon-folder-close"></i>
                            <strong>${escapeHtml(role.name)}</strong>
                        </span>
                        <span>
                            <span class="badge" style="background: #6c5ce7; color: #fff;">${userCount} 用户</span>
                            <button class="btn btn-danger btn-xs" onclick="event.stopPropagation(); deleteRole(${role.id}, '${escapeHtml(role.name)}')" title="删除">
                                <i class="glyphicon glyphicon-trash"></i>
                            </button>
                        </span>
                    </div>
                </div>
            `;
        });

        $container.html(html);

        // 默认选中第一个
        if (!currentRoleId && roles.length > 0) {
            selectRole(roles[0].id);
        }
    }

    // ===== 选择角色 =====

    window.selectRole = function(roleId) {
        currentRoleId = roleId;
        loadRoles(); // 刷新高亮
        loadPermissions(roleId);
    };

    // ===== 加载权限 =====

    function loadPermissions(roleId) {
        $('#permissionTree').html(`
            <div class="text-center text-muted" style="padding: 40px 0;">
                <i class="glyphicon glyphicon-refresh spinning"></i> 加载权限...
            </div>
        `);

        // 先加载所有权限
        $.ajax({
            url: API.PERMISSIONS,
            type: 'GET',
            data: {
                username: username  // ✅ 传递用户名
            },
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    allPermissions = res.data || [];
                    
                    // 然后加载角色的权限
                    $.ajax({
                        url: API.ROLES,
                        type: 'GET',
                        data: {
                            username: username  // ✅ 传递用户名
                        },
                        xhrFields: { withCredentials: true },
                        success: function(roleRes) {
                            if (roleRes.code === '1') {
                                const role = roleRes.data.find(r => r.id === roleId);
                                const permIds = role ? role.permissions || [] : [];
                                renderPermissionTree(allPermissions, permIds, role);
                            }
                        }
                    });
                }
            },
            error: function() {
                showNotice('加载权限失败', 'error');
            }
        });
    }

    function renderPermissionTree(permissions, selectedPermIds, role) {
        const $container = $('#permissionTree');
        
        if (!permissions || permissions.length === 0) {
            $container.html(`
                <div class="text-center text-muted" style="padding: 40px 0;">
                    <i class="glyphicon glyphicon-info-sign" style="font-size: 32px;"></i>
                    <p style="margin-top: 12px;">暂无可用权限</p>
                </div>
            `);
            return;
        }

        // 更新标题
        $('#permissionTitle').html(`
            <i class="glyphicon glyphicon-lock"></i> 
            ${role ? role.name : '权限配置'} 
            <small class="text-muted">(${selectedPermIds ? selectedPermIds.length : 0} 项权限)</small>
        `);

        // 权限图标映射
        const iconMap = {
            '系统管理': 'glyphicon-cog',
            '用户管理': 'glyphicon-user',
            '内容管理': 'glyphicon-file',
            '扩展管理': 'glyphicon-puzzle-piece',
        };

        let html = '';
        permissions.forEach(group => {
            const icon = iconMap[group.name] || 'glyphicon-folder-close';
            const groupPerms = group.permissions || [];
            
            html += `
                <div class="perm-group-title">
                    <i class="glyphicon ${icon}"></i> ${group.name}
                    <span class="badge" style="background: #e2e8f0; color: #4a5568;">${groupPerms.length}</span>
                </div>
            `;

            groupPerms.forEach(perm => {
                const checked = selectedPermIds && selectedPermIds.includes(perm.id) ? 'checked' : '';
                html += `
                    <div class="perm-item perm-level-2">
                        <label class="perm-label" style="cursor: pointer;">
                            <input type="checkbox" class="perm-checkbox" 
                                   value="${perm.id}" ${checked}
                                   data-perm-name="${escapeHtml(perm.name)}">
                            ${escapeHtml(perm.name)}
                        </label>
                    </div>
                `;
            });
        });

        $container.html(html);

        // 存储当前选中的权限ID
        $container.data('selectedPermIds', selectedPermIds || []);
    }

    // ===== 保存权限 =====

    $('#savePermissionBtn').on('click', function() {
        if (!currentRoleId) {
            showNotice('请先选择一个角色', 'warning');
            return;
        }

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> 保存中...');

        // 获取选中的权限
        const selectedIds = [];
        $('.perm-checkbox:checked').each(function() {
            selectedIds.push(parseInt($(this).val()));
        });

        // 获取角色名称
        const roleName = $('#roleList .role-card.active .card-header strong').text();

        $.ajax({
            url: API.ROLE_UPDATE,
            type: 'POST',
            data: JSON.stringify({
                id: currentRoleId,
                name: roleName,
                username: username,
                permissions: selectedIds
            }),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    showNotice('权限保存成功', 'success');
                    loadRoles();
                    // 更新权限树显示
                    $('#permissionTree').data('selectedPermIds', selectedIds);
                } else {
                    showNotice(res.msg || '保存失败', 'error');
                }
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存权限');
            },
            error: function() {
                showNotice('网络错误，请重试', 'error');
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存权限');
            }
        });
    });

    // ===== 全选/取消全选 =====

    $('#selectAllBtn').on('click', function() {
        $('.perm-checkbox').prop('checked', true);
    });

    $('#deselectAllBtn').on('click', function() {
        $('.perm-checkbox').prop('checked', false);
    });

    // ===== 新增角色 =====

    $('#addRoleBtn').on('click', function() {
        $('#roleModalTitle').html('<i class="glyphicon glyphicon-plus"></i> 新增角色');
        $('#editRoleId').val('');
        $('#roleName').val('');
        $('#roleModal').modal('show');
    });

    // ===== 保存角色 =====

    $('#saveRoleBtn').on('click', function() {
        const roleId = $('#editRoleId').val();
        const roleName = $('#roleName').val().trim();

        if (!roleName) {
            showNotice('请输入角色名称', 'error');
            return;
        }

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> 保存中...');

        const url = roleId ? API.ROLE_UPDATE : API.ROLE_CREATE;
        const data = {
            name: roleName,
            username: username,
            permissions: []
        };
        if (roleId) {
            data.id = parseInt(roleId);
        }

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    $('#roleModal').modal('hide');
                    showNotice(res.msg || '保存成功', 'success');
                    loadRoles();
                } else {
                    showNotice(res.msg || '保存失败', 'error');
                }
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存');
            },
            error: function() {
                showNotice('网络错误，请重试', 'error');
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-save"></i> 保存');
            }
        });
    });

    // ===== 删除角色 =====

    window.deleteRole = function(roleId, roleName) {
        deleteRoleId = roleId;
        $('#deleteRoleName').text(roleName);
        $('#deleteModal').modal('show');
    };

    $('#confirmDeleteBtn').on('click', function() {
        if (!deleteRoleId) return;

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> 删除中...');

        $.ajax({
            url: API.ROLE_DELETE,
            type: 'POST',
            data: JSON.stringify({ id: deleteRoleId, username: username }),
            contentType: 'application/json',
            xhrFields: { withCredentials: true },
            success: function(res) {
                if (res.code === '1') {
                    $('#deleteModal').modal('hide');
                    showNotice(res.msg || '删除成功', 'success');
                    if (currentRoleId === deleteRoleId) {
                        currentRoleId = null;
                    }
                    loadRoles();
                } else {
                    showNotice(res.msg || '删除失败', 'error');
                }
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-trash"></i> 确认删除');
                deleteRoleId = null;
            },
            error: function() {
                showNotice('网络错误，请重试', 'error');
                $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-trash"></i> 确认删除');
            }
        });
    });

    // ===== 更新统计 =====

    function updateStats(roles) {
        if (!roles) return;
        $('#totalRoles').text(roles.length || 0);
        
        let totalUsers = 0;
        roles.forEach(r => {
            totalUsers += (r.user_count || 0);
        });
        $('#totalAssignedUsers').text(totalUsers);
        
        // 计算总权限数
        let totalPerms = 0;
        roles.forEach(r => {
            totalPerms += (r.permissions ? r.permissions.length : 0);
        });
        $('#totalPermissions').text(totalPerms);
        
        // 计算菜单组数（从权限中提取）
        const menuGroups = new Set();
        roles.forEach(r => {
            if (r.permissions) {
                r.permissions.forEach(p => {
                    // 这里需要根据实际权限名称分组
                });
            }
        });
        $('#totalMenuGroups').text(roles.length);
    }

    // ===== 刷新 =====

    $('#refreshRolesBtn').on('click', function() {
        const $btn = $(this);
        $btn.find('i').addClass('spinning');
        loadRoles();
        setTimeout(() => {
            $btn.find('i').removeClass('spinning');
        }, 500);
    });

    // ===== 工具函数 =====

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotice(msg, type) {
        if (typeof notices === 'function') {
            notices(msg, type);
        } else {
            const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';
            const $alert = $(`<div class="alert ${alertClass} alert-dismissible fade show" style="position:fixed;top:20px;right:20px;z-index:9999;min-width:300px;">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                ${msg}
            </div>`);
            $('body').append($alert);
            setTimeout(() => $alert.alert('close'), 3000);
        }
    }

    // ===== 初始化 =====

    loadRoles();
});