
jQuery(document).ready(function () {
    $('#notices').append(alerterrtipsHtml());

    $('#errtips').css({ display: "none" });
    
    const usermemory = JSON.parse(localStorage.getItem(USER_KEY) || '{}')
    if(usermemory.username){
        window.location.href = 'index.html';
    }

    $("#login").click(function () {    //表单提交时监听提交事件
        let username = $('#username').val();
        let password = $('#password').val();
        if (username.length == 0 || password.length == 0) {
            notices("用户名/密码不能为空");
            return;
        }
        $.ajax({
            url: "http://127.0.0.1:8000/Authlogin/login/",       //提交地址：默认是form的action,如果申明,则会覆盖
            method: "POST",
            data: { username: username, password: password },
            dataType: "json",
            // contentType: 'application/json',  	//一定要指定格式 contentType
            async: false,
            success: function (data) {
                if ("1".localeCompare(data.code) == 0) {
                    const usetname = data.username
                    user = {username}
                    saveUser({username})

                    window.location.href = 'index.html';
                } else if ("0".localeCompare(data.code) == 0) {
                    notices(data.msg);
                }
            },
            error: function (data) {
                notices("请求失败");
            },
        })
    })
});