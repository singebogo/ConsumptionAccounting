jQuery(document).ready(function () {
    $('#notices').append(alerterrtipsHtml());
    $('#errtips').css({ display: "none" });

    const usermemory = JSON.parse(localStorage.getItem(USER_KEY) || '{}')
    if(usermemory.username){
        window.location.href = 'index.html';
    }
    // 页面加载时检查登录状态
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            $('#username').val(user.username);

            if ($('#remember').is(':checked')) {
                $('#remember').prop('checked', true);
            }
        } catch (e) {
            // 兼容旧格式
            const oldUser = sessionStorage.getItem('user') || localStorage.getItem('rememberUsername');
            if (oldUser) {
                $('#username').val(oldUser);
            }
        }
    }

    // 回车登录
    $('#password').keypress(function(e) {
        if (e.which === 13) {
            $('#login').click();
        }
    });

    $('#login').click(function() {
        const username = $('#username').val().trim();
        const password = $('#password').val().trim();

        if (!username || !password) {
            notices('请输入用户名和密码', 'error');
            return;
        }

        $.ajax({
            url: login_url,
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            xhrFields: {
                withCredentials: true  // ✅ 关键：允许携带和接收 Cookie
            },
            success: function(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;

                if (data.code === '1') {
                    // ✅ 统一使用对象格式存储
                    const userInfo = {
                        username: data.username || username,
                        isAuthenticated: true,
                        loginTime: new Date().getTime(),
                        role: '管理员'  // 可以从后端获取
                    };
                    // 存储 token（如果后端返回）
                    if (data.token) {
                        localStorage.setItem('auth_token', data.token);
                        sessionStorage.setItem('auth_token', data.token);
                    }

                    // sessionStorage - 会话存储
                    sessionStorage.setItem('user', JSON.stringify(userInfo));

                    // 存储登录标记，用于 isAuthenticated 函数检查
                    sessionStorage.setItem('isLoggedIn', 'true');

                    // localStorage - 记住我
                    if ($('#remember').is(':checked')) {
                        localStorage.setItem('user', JSON.stringify(userInfo));
                        // ✅ 兼容旧的 rememberUsername
                        localStorage.setItem('rememberUsername', username);
                        localStorage.setItem('isLoggedIn', 'true');
                    } else {
                        localStorage.removeItem('user');
                        localStorage.removeItem('rememberUsername');
                        localStorage.removeItem('isLoggedIn');
                    }

                    notices('登录成功', 'success');

                    // 跳转到首页
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 1000);
                } else {
                    notices(data.msg || '登录失败', 'error');
                }
            },
            error: function(xhr) {
                notices('网络错误，请重试', 'error');
            }
        });
    });
});