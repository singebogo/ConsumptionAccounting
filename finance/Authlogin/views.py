import json
from django.shortcuts import render, redirect
from django.http.response import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError

from notification.views import cors_json_response, check_user_authenticated


@csrf_exempt
def Authlogin(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            return HttpResponse(json.dumps({'code': "0", 'msg': "用户名或密码错误"}))
        else:
            if user.is_active:
                login(request, user)
                request.session["user"] = username
                request.session.set_expiry(None)
                return HttpResponse(json.dumps({'code': "1", 'msg': "登录成功", 'username': username}))
            else:
                return HttpResponse(json.dumps({'code': "0", 'msg': "用户失效"}))
    return HttpResponse(json.dumps({'code': "0", 'msg': "登录失败"}))


@csrf_exempt
def Authlogout(request):
    logout(request)
    return HttpResponse(json.dumps({'code': "1", 'msg': "成功登出"}))


@csrf_exempt
def reg_view(request):
    """用户注册"""
    if request.method == 'POST':
        # 🐛 修复1: uesename -> username (拼写错误)
        # 🐛 修复2: 添加异常处理
        username = request.POST.get("username")  # 改为username，与前端保持一致
        pwd1 = request.POST.get("password1")
        pwd2 = request.POST.get("password2")

        # 表单验证
        if not username or not pwd1 or not pwd2:
            return JsonResponse({'code': '0', 'msg': '请完整填写所有字段'})

        if len(username) < 3:
            return JsonResponse({'code': '0', 'msg': '用户名至少3个字符'})

        if len(pwd1) < 6:
            return JsonResponse({'code': '0', 'msg': '密码至少6位'})

        if pwd1 != pwd2:
            return JsonResponse({'code': '0', 'msg': '两次输入的密码不一致'})

        # 检查用户是否已存在
        if User.objects.filter(username=username).exists():
            return JsonResponse({'code': '0', 'msg': '该用户名已注册，请直接登录'})

        try:
            # 创建用户
            user = User.objects.create_user(
                username=username,
                password=pwd1,
                email=request.POST.get("email", "")
            )

            # 自动登录（可选）
            login(request, user)

            return JsonResponse({
                'code': '1',
                'msg': '注册成功',
                'redirect': './index.html'  # 注册后跳转地址
            })

        except IntegrityError:
            return JsonResponse({'code': '0', 'msg': '用户名已存在，请选择其他用户名'})
        except Exception as e:
            return JsonResponse({'code': '0', 'msg': f'注册失败: {str(e)}'})

    return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def user_info(request):
    """获取当前用户信息"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        if not request.user.is_authenticated:
            return cors_json_response({
                'code': '401',
                'msg': '未登录',
                'data': None
            }, status=401)

        # 获取用户角色（根据你的业务逻辑）
        role = '管理员'
        if request.user.is_superuser:
            role = '超级管理员'
        elif request.user.is_staff:
            role = '系统管理员'
        else:
            role = '普通用户'

        return cors_json_response({
            'code': '1',
            'msg': 'success',
            'data': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'role': role,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'date_joined': request.user.date_joined
            }
        })

    return cors_json_response({
        'code': '0',
        'msg': '不支持的请求方法'
    })


@csrf_exempt
def user_search(request):
    """搜索用户"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            keyword = request.GET.get('keyword', '')

            if len(keyword) < 2:
                return cors_json_response({
                    'code': '1',
                    'msg': 'success',
                    'data': []
                })

            # 搜索用户
            users = User.objects.filter(
                Q(username__icontains=keyword) |
                Q(email__icontains=keyword) |
                Q(first_name__icontains=keyword) |
                Q(last_name__icontains=keyword)
            ).exclude(
                id=request.user.id  # 排除自己
            )[:10]

            data = []
            for user in users:
                data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'department': get_user_department(user)
                })

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': data
            })
        except Exception as e:
            logger.error(f"搜索用户失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def user_list(request):
    """获取用户列表（通讯录）"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            department = request.GET.get('department', '')

            queryset = User.objects.filter(is_active=True).exclude(id=request.user.id)

            if department:
                # 根据部门筛选（需要扩展UserProfile）
                pass

            paginator = Paginator(queryset, page_size)
            users = paginator.get_page(page)

            data = []
            for user in users:
                data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'department': get_user_department(user)
                })

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'list': data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size
                }
            })
        except Exception as e:
            logger.error(f"获取用户列表失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def user_detail(request, user_id):
    """获取用户详情"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        # 检查用户认证
        auth_response = check_user_authenticated(request)
        if auth_response:
            return auth_response

        try:
            user = get_object_or_404(User, id=user_id, is_active=True)

            return cors_json_response({
                'code': '1',
                'msg': 'success',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'department': get_user_department(user),
                    'is_online': False,  # TODO: 实现在线状态
                    'last_login': user.last_login
                }
            })
        except Exception as e:
            logger.error(f"获取用户详情失败: {e}")
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


def get_user_department(user):
    """获取用户部门（根据你的业务逻辑实现）"""
    # TODO: 从UserProfile或关联表获取部门
    return '财务部' if user.id % 2 == 0 else '技术部'