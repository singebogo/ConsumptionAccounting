// ===== js/utils/userInfo.js - 统一用户信息管理 =====

// 使用立即执行函数表达式(IIFE)创建模块
window.UserInfo = (function() {

    /**
     * 获取当前登录用户信息
     */
    function getCurrentUser() {
        // 1. 优先从 sessionStorage 获取
        let userStr = sessionStorage.getItem('user');

        // 2. 再从 localStorage 获取
        if (!userStr) {
            userStr = localStorage.getItem('user');
        }

        // 3. 如果都没有，尝试兼容旧的 rememberUsername
        if (!userStr) {
            const oldUsername = localStorage.getItem('rememberUsername');
            if (oldUsername) {
                return {
                    username: oldUsername,
                    isAuthenticated: true,
                    fromOldStorage: true
                };
            }
        }

        // 4. 解析JSON对象
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    username: user.username || user.name || user,
                    isAuthenticated: true,
                    role: user.role,
                    ...user
                };
            } catch (e) {
                return {
                    username: userStr,
                    isAuthenticated: true,
                    fromOldStorage: true
                };
            }
        }

        // 5. 从页面元素获取
        const $username = $('#username');
        if ($username.length && $username.text() &&
            $username.text() !== '加载中...' && $username.text() !== '未登录') {
            return {
                username: $username.text(),
                isAuthenticated: true,
                fromPage: true
            };
        }

        return null;
    }

    /**
     * 检查是否已登录
     */
    function isAuthenticated() {
        return !!getCurrentUser();
    }

    /**
     * 获取用户名
     */
    function getUsername() {
        const user = getCurrentUser();
        return user ? user.username : null;
    }

    /**
     * 获取用户角色
     */
    function getUserRole() {
        const user = getCurrentUser();
        return user ? user.role : null;
    }

    /**
     * 初始化用户信息显示
     */
    function initUserInfo() {
        let username = null;
        let role = null;

        const user = getCurrentUser();
        if (user) {
            username = user.username;
            role = user.role;
        }

        if (username) {
            $('#username').text(username);
            $('#userDisplayName').text(username);

            if (role) {
                $('.user-role, #userRole, #userRoleSmall').text(role);
            } else {
                // 从后端获取角色信息
                $.ajax({
                    url: notificationUserInfo_url, // ✅ 修正API路径
                    type: 'GET',
                    xhrFields: { withCredentials: true },
                    success: function(res) {
                        if (res.code === '1' && res.data.role) {
                            $('.user-role, #userRole, #userRoleSmall').text(res.data.role);
                            // 更新存储
                            try {
                                const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
                                if (userStr) {
                                    const user = JSON.parse(userStr);
                                    user.role = res.data.role;
                                    sessionStorage.setItem('user', JSON.stringify(user));
                                }
                            } catch (e) {}
                        }
                    },
                    error: function() {
                        $('.user-role, #userRole, #userRoleSmall').text('管理员');
                    }
                });
            }
        } else {
            $('#username').text('未登录');
            $('#userDisplayName').text('未登录');
            $('.user-role, #userRole, #userRoleSmall').text('');
        }
    }

    // 暴露公共API
    return {
        getCurrentUser: getCurrentUser,
        isAuthenticated: isAuthenticated,
        getUsername: getUsername,
        getUserRole: getUserRole,
        initUserInfo: initUserInfo
    };

})();

// 页面加载时自动初始化
$(function() {
    window.UserInfo.initUserInfo();

    // 监听存储变化
    window.addEventListener('storage', function(e) {
        if (e.key === 'user' || e.key === 'rememberUsername') {
            window.UserInfo.initUserInfo();
        }
    });
});