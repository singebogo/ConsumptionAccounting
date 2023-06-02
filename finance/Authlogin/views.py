import json
from django.shortcuts import render
from django.http.response import HttpResponse, HttpResponseRedirect
import json

# 用户模型
from django.contrib.auth.models import User
# 登录状态检验的装饰器
from django.contrib.auth.decorators import login_required
# 记录登录状态、退出登录状态、登录用户信息的校验
from django.contrib.auth import login, logout, authenticate

from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def Authlogin(request):
    # ResponseHeaders("Access-Control-Allow-Origin", "*")
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            # 用户名或密码错误
            return HttpResponse(json.dumps({'code': "0", 'msg': "用户名或密码错误"}))
        else:
            if user.is_active:
                # 校验成功
                # 记录会话登录状态
                login(request, user)
                request.session["user"] = username  # 加session
                request.session.set_expiry(None)  # 设置session有效期:0为关闭浏览器马上失效，none为永久
                return HttpResponse(json.dumps({'code': "1",'msg': "登录成功", 'username': username}))
            else:
                return HttpResponse(json.dumps({'code': "0",'msg': "用户失效"}))
    return HttpResponse(json.dumps({'code': "0",'msg': "登录失败"}))

@csrf_exempt
def Authlogout(request):
    logout(request)
    # 请求传过来，然后将session清空，从而取消登录
    return HttpResponse(json.dumps({'code': "1", 'msg': "成功登出"}))

def reg_view(request):
    # 注册
    if request.method == "GET":
        return render(request,"reg_view")
    elif request.method == 'POST':
        username = request.POST.get("user")
        pwd1 = request.POST.get("pwd1")
        pwd2 = request.POST.get("pwd2")
        if not User.objects.filter(uesename=username):
            if pwd1 == pwd2:
                # 这里可以try一下，因为用户名唯一性，可能会出现SQL唯一性异常报错
                user = User.objects.create_user(username=username,password=pwd1)
            else:
                return HttpResponse("密码不一致，请重新输入")
        else:
            return HttpResponse("该用户名已注册，请重新输入")

        # # 实现用户注册后免登录
        # login(request,user)
        # return HttpResponseRedirect("/index")
        return HttpResponseRedirect("/login")
