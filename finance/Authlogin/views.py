import json

from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.http.response import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed

from notification.views import cors_json_response, check_user_authenticated

# 添加 Token 生成信号
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

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

                # ✅ 生成或获取 Token
                token, created = Token.objects.get_or_create(user=user)

                return HttpResponse(json.dumps({
                    'code': "1",
                    'msg': "登录成功",
                    'username': username,
                    'token': token.key  # ✅ 返回 Token
                }))
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
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})


@csrf_exempt
def user_list(request):
    """获取用户列表"""
    if request.method != 'GET':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    # 获取参数
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    keyword = request.GET.get('keyword', '')
    status = request.GET.get('status', '')
    role = request.GET.get('role', '')
    username_param = request.GET.get('username', '')

    # ✅ 如果未认证，尝试通过 username 参数获取用户
    if not request.user.is_authenticated and username_param:
        try:
            user = User.objects.get(username=username_param)
            request.user = user
        except User.DoesNotExist:
            pass

    # ✅ 检查权限（只有管理员可以查看用户列表）
    if request.user.is_authenticated:
        if not (request.user.is_superuser or request.user.is_staff):
            if not request.user.groups.filter(name__in=['管理员', 'admin']).exists():
                return JsonResponse({'code': '403', 'msg': '无权限访问'})
    else:
        return JsonResponse({'code': '401', 'msg': '请先登录'})

    # 查询
    queryset = User.objects.all().order_by('-date_joined')

    if keyword:
        queryset = queryset.filter(
            Q(username__icontains=keyword) | Q(email__icontains=keyword)
        )

    if status == '1':
        queryset = queryset.filter(is_active=True)
    elif status == '0':
        queryset = queryset.filter(is_active=False)

    # 统计
    stats = {
        'total': User.objects.count(),
        'active': User.objects.filter(is_active=True).count(),
        'inactive': User.objects.filter(is_active=False).count(),
        'admin': User.objects.filter(is_superuser=True).count(),
    }

    # 分页
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    users = queryset[start:end]

    # 序列化 - ✅ 添加角色信息
    user_list = []
    for user in users:
        # 获取用户所属组
        groups = user.groups.all()
        group_names = [g.name for g in groups]
        group_ids = [g.id for g in groups]

        # ✅ 确定角色（优先使用 Group，其次使用内置角色）
        if group_ids:
            # 用户有自定义角色组
            role_type = 'group'
            role_display = group_names[0] if group_names else '未知角色'
            role_id = group_ids[0] if group_ids else None
        elif user.is_superuser:
            role_type = 'admin'
            role_display = '管理员'
            role_id = None
        elif user.is_staff:
            role_type = 'staff'
            role_display = '工作人员'
            role_id = None
        else:
            role_type = 'guest'
            role_display = '游客'
            role_id = None

        user_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'role_type': role_type,  # ✅ 角色类型: admin/staff/guest/group
            'role_display': role_display,  # ✅ 显示名称
            'role_id': role_id,  # ✅ 如果是 group 类型，这是 Group ID
            'groups': group_names,  # ✅ 用户组名称列表
            'group_ids': group_ids,  # ✅ 用户组ID列表
            'last_login': user.last_login,
            'date_joined': user.date_joined,
        })

    return JsonResponse({
        'code': '1',
        'msg': 'success',
        'data': {
            'list': user_list,
            'total': total,
            'page': page,
            'page_size': page_size,
            'stats': stats,
        }
    })

@csrf_exempt
def user_detail(request, user_id):
    """获取用户详情"""
    if request.method == 'OPTIONS':
        return cors_json_response({})

    if request.method == 'GET':
        username_param = request.GET.get('username')

        # ✅ 如果未认证，尝试通过 username 参数获取用户
        if not request.user.is_authenticated and username_param:
            try:
                user = User.objects.get(username=username_param)
                request.user = user
            except User.DoesNotExist:
                return cors_json_response({'code': '401', 'msg': '用户未认证'})

        if not request.user.is_authenticated:
            return cors_json_response({'code': '401', 'msg': '用户未认证'})

        try:
            user = get_object_or_404(User, id=user_id)

            # 获取用户所属组
            groups = user.groups.all()
            group_names = [g.name for g in groups]
            group_ids = [g.id for g in groups]

            # ✅ 确定角色（优先使用 Group，其次使用内置角色）
            if group_ids:
                # 用户有自定义角色组
                role_type = 'group'
                role_display = group_names[0] if group_names else '未知角色'
                role_id = group_ids[0] if group_ids else None
            elif user.is_superuser:
                role_type = 'admin'
                role_display = '管理员'
                role_id = None
            elif user.is_staff:
                role_type = 'staff'
                role_display = '工作人员'
                role_id = None
            else:
                role_type = 'guest'
                role_display = '游客'
                role_id = None

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
                    'is_online': False,
                    'is_active': user.is_active,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                    'role_type': role_type,  # ✅ 角色类型: admin/staff/guest/group
                    'role_display': role_display,  # ✅ 显示名称
                    'role_id': role_id,  # ✅ 如果是 group 类型，这是 Group ID
                    'groups': group_names,  # ✅ 用户组名称列表
                    'group_ids': group_ids,  # ✅ 用户组ID列表
                    'last_login': user.last_login
                }
            })
        except Exception as e:
            return cors_json_response({'code': '0', 'msg': str(e)})

    return cors_json_response({'code': '0', 'msg': '不支持的请求方法'})

def get_user_department(user):
    """获取用户部门（根据你的业务逻辑实现）"""
    # TODO: 从UserProfile或关联表获取部门
    return '财务部' if user.id % 2 == 0 else '技术部'

@csrf_exempt
def user_create(request):
    """创建用户"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')
        is_active = data.get('is_active', True)
        group_ids = data.get('group_ids', [])  # ✅ 用户组ID列表

        # 验证
        if not username:
            return JsonResponse({'code': '0', 'msg': '用户名不能为空'})
        if User.objects.filter(username=username).exists():
            return JsonResponse({'code': '0', 'msg': '用户名已存在'})
        if not password or len(password) < 8:
            return JsonResponse({'code': '0', 'msg': '密码至少8位'})

        # 创建用户
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_active = is_active
        user.is_superuser = (role == 'admin')
        user.is_staff = (role in ['admin', 'manager', 'staff'])
        user.save()

        # ✅ 分配用户组
        if group_ids:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)

        return JsonResponse({
            'code': '1',
            'msg': '用户创建成功',
            'data': {'id': user.id}
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})
@csrf_exempt
def user_update(request):
    """更新用户"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    try:
        data = json.loads(request.body)
        user_id = data.get('id')
        username_param = data.get('username_param', '')

        # ✅ 认证检查
        if not request.user.is_authenticated:
            if username_param:
                try:
                    user = User.objects.get(username=username_param)
                    request.user = user
                except User.DoesNotExist:
                    return JsonResponse({'code': '401', 'msg': '用户未认证'})
            else:
                return JsonResponse({'code': '401', 'msg': '用户未认证'})

        if not user_id:
            return JsonResponse({'code': '0', 'msg': '用户ID不能为空'})

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'code': '0', 'msg': '用户不存在'})

        # 更新字段
        if data.get('username'):
            if User.objects.filter(username=data['username']).exclude(id=user_id).exists():
                return JsonResponse({'code': '0', 'msg': '用户名已存在'})
            user.username = data['username']

        if data.get('email'):
            user.email = data['email']

        if data.get('password'):
            user.password = make_password(data['password'])

        if 'is_active' in data:
            user.is_active = data['is_active']

        role = data.get('role', 'user')
        user.is_superuser = (role == 'admin')
        user.is_staff = (role in ['admin', 'manager', 'staff'])

        # ✅ 更新用户组
        group_ids = data.get('group_ids', [])
        if group_ids is not None:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)

        user.save()

        return JsonResponse({
            'code': '1',
            'msg': '用户更新成功'
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})

@csrf_exempt
def role_list_all(request):
    """获取所有角色列表（用于下拉选择）"""
    if request.method != 'GET':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    try:
        groups = Group.objects.all()
        data = []
        for group in groups:
            data.append({
                'id': group.id,
                'name': group.name,
                'user_count': group.user_set.count()
            })

        return JsonResponse({
            'code': '1',
            'msg': 'success',
            'data': data
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})

@csrf_exempt
def user_delete(request):
    """删除用户"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    try:
        data = json.loads(request.body)
        user_id = data.get('id')

        if not user_id:
            return JsonResponse({'code': '0', 'msg': '用户ID不能为空'})

        user = User.objects.get(id=user_id)
        user.delete()

        return JsonResponse({
            'code': '1',
            'msg': '用户删除成功'
        })
    except User.DoesNotExist:
        return JsonResponse({'code': '0', 'msg': '用户不存在'})
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def user_reset_password(request):
    """重置密码"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    try:
        data = json.loads(request.body)
        user_id = data.get('id')

        if not user_id:
            return JsonResponse({'code': '0', 'msg': '用户ID不能为空'})

        user = User.objects.get(id=user_id)
        import random
        import string
        new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        user.set_password(new_password)
        user.save()

        # TODO: 发送邮件通知用户
        # send_password_reset_email(user.email, new_password)

        return JsonResponse({
            'code': '1',
            'msg': '密码重置成功'
        })
    except User.DoesNotExist:
        return JsonResponse({'code': '0', 'msg': '用户不存在'})
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


# ==================== 权限管理 API ====================

@csrf_exempt
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def role_list(request):
    """获取所有角色列表"""
    if request.method != 'GET':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    # 检查用户权限
    # ✅ 尝试从 GET 参数获取用户名
    username_param = request.GET.get('username')

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return JsonResponse({'code': '403', 'msg': '用户未认证'})

    # 打印调试信息
    print(f"获取菜单，用户: {request.user.username}, 认证状态: {request.user.is_authenticated}")

    try:
        groups = Group.objects.all()
        data = []
        for group in groups:
            data.append({
                'id': group.id,
                'name': group.name,
                'permissions': list(group.permissions.values_list('id', flat=True)),
                'user_count': group.user_set.count(),
                'created_at': group.id  # 可以用其他字段
            })

        return JsonResponse({
            'code': '1',
            'msg': 'success',
            'data': data
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def role_create(request):
    """创建角色"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})
    data = json.loads(request.body)
    username_param = data.get('username', '').strip()

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return JsonResponse({'code': '403', 'msg': '用户未认证'})

    try:
        role_name = data.get('name', '').strip()

        if not role_name:
            return JsonResponse({'code': '0', 'msg': '角色名称不能为空'})

        if Group.objects.filter(name=role_name).exists():
            return JsonResponse({'code': '0', 'msg': '角色名称已存在'})

        group = Group.objects.create(name=role_name)

        # 添加权限
        permission_ids = data.get('permissions', [])
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            group.permissions.set(permissions)

        return JsonResponse({
            'code': '1',
            'msg': '角色创建成功',
            'data': {'id': group.id}
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def role_update(request):
    """更新角色"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    data = json.loads(request.body)
    username_param = data.get('username', '').strip()

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return JsonResponse({'code': '403', 'msg': '用户未认证'})

    try:

        role_id = data.get('id')
        role_name = data.get('name', '').strip()

        if not role_id:
            return JsonResponse({'code': '0', 'msg': '角色ID不能为空'})

        try:
            group = Group.objects.get(id=role_id)
        except Group.DoesNotExist:
            return JsonResponse({'code': '0', 'msg': '角色不存在'})

        if role_name and role_name != group.name:
            if Group.objects.filter(name=role_name).exclude(id=role_id).exists():
                return JsonResponse({'code': '0', 'msg': '角色名称已存在'})
            group.name = role_name

        # 更新权限
        permission_ids = data.get('permissions', [])
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            group.permissions.set(permissions)
        else:
            group.permissions.clear()

        group.save()

        return JsonResponse({
            'code': '1',
            'msg': '角色更新成功'
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def role_delete(request):
    """删除角色"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    data = json.loads(request.body)
    username_param = data.get('username', '').strip()

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return JsonResponse({'code': '403', 'msg': '用户未认证'})


    try:

        role_id = data.get('id')

        if not role_id:
            return JsonResponse({'code': '0', 'msg': '角色ID不能为空'})

        group = Group.objects.get(id=role_id)
        group.delete()

        return JsonResponse({
            'code': '1',
            'msg': '角色删除成功'
        })
    except Group.DoesNotExist:
        return JsonResponse({'code': '0', 'msg': '角色不存在'})
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def permission_list(request):
    """获取所有权限列表"""
    if request.method != 'GET':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    # 检查用户权限
    # ✅ 尝试从 GET 参数获取用户名
    username_param = request.GET.get('username')

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return JsonResponse({'code': '403', 'msg': '用户未认证'})

    # 打印调试信息
    print(f"获取菜单，用户: {request.user.username}, 认证状态: {request.user.is_authenticated}")

    try:
        # 获取所有权限，按应用和模型分组
        permissions = Permission.objects.select_related('content_type').order_by('content_type__app_label',
                                                                                 'content_type__model')

        # 预定义菜单权限结构
        menu_permissions = {
            'system': {
                'name': '系统管理',
                'icon': 'glyphicon-cog',
                'permissions': []
            },
            'user': {
                'name': '用户管理',
                'icon': 'glyphicon-user',
                'permissions': []
            },
            'content': {
                'name': '内容管理',
                'icon': 'glyphicon-file',
                'permissions': []
            },
            'extension': {
                'name': '扩展管理',
                'icon': 'glyphicon-puzzle-piece',
                'permissions': []
            }
        }

        # 将权限分配到对应的菜单组
        for perm in permissions:
            # 根据权限名称匹配到对应的菜单组
            perm_name = perm.name
            if '用户' in perm_name or '角色' in perm_name:
                menu_permissions['user']['permissions'].append({
                    'id': perm.id,
                    'name': perm_name,
                    'codename': perm.codename
                })
            elif '配置' in perm_name or '设置' in perm_name or '导航' in perm_name:
                menu_permissions['system']['permissions'].append({
                    'id': perm.id,
                    'name': perm_name,
                    'codename': perm.codename
                })
            elif '文章' in perm_name or '文档' in perm_name or '单页' in perm_name:
                menu_permissions['content']['permissions'].append({
                    'id': perm.id,
                    'name': perm_name,
                    'codename': perm.codename
                })
            elif '广告' in perm_name or '链接' in perm_name or '附件' in perm_name:
                menu_permissions['extension']['permissions'].append({
                    'id': perm.id,
                    'name': perm_name,
                    'codename': perm.codename
                })

        # 转换为列表格式
        menu_list = []
        for key, value in menu_permissions.items():
            if value['permissions']:
                menu_list.append({
                    'key': key,
                    'name': value['name'],
                    'icon': value['icon'],
                    'permissions': value['permissions']
                })

        return JsonResponse({
            'code': '1',
            'msg': 'success',
            'data': menu_list
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def user_assign_role(request):
    """为用户分配角色"""
    if request.method != 'POST':
        return JsonResponse({'code': '0', 'msg': '不支持的请求方法'})

    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'code': '403', 'msg': '无权限访问'})

    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        role_id = data.get('role_id')

        if not user_id:
            return JsonResponse({'code': '0', 'msg': '用户ID不能为空'})

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'code': '0', 'msg': '用户不存在'})

        # 清除用户所有角色
        user.groups.clear()

        # 分配新角色
        if role_id:
            try:
                group = Group.objects.get(id=role_id)
                user.groups.add(group)
            except Group.DoesNotExist:
                return JsonResponse({'code': '0', 'msg': '角色不存在'})

        return JsonResponse({
            'code': '1',
            'msg': '角色分配成功'
        })
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


@csrf_exempt
def user_get_roles(request):
    """获取用户分配的角色"""
    # ✅ 尝试从 GET 参数获取用户名
    username_param = request.GET.get('username')

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return JsonResponse({'code': '403', 'msg': '无权限访问'})

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        return JsonResponse({'code': '403', 'msg': '用户未认证'})

    # 打印调试信息
    print(f"获取菜单，用户: {request.user.username}, 认证状态: {request.user.is_authenticated}")

    try:
        groups = user.groups.all()

        role_ids = [group.id for group in groups]

        return JsonResponse({
            'code': '1',
            'msg': 'success',
            'data': {
                'role_ids': role_ids,
                'roles': [{'id': g.id, 'name': g.name} for g in groups]
            }
        })
    except User.DoesNotExist:
        return JsonResponse({'code': '0', 'msg': '用户不存在'})
    except Exception as e:
        return JsonResponse({'code': '0', 'msg': str(e)})


def get_user_menus(request):
    """获取当前用户的菜单权限"""

    # ✅ 尝试从 GET 参数获取用户名
    username_param = request.GET.get('username')

    # ✅ 如果 request.user 是 AnonymousUser，但传递了 username 参数
    if not request.user.is_authenticated and username_param:
        try:
            # 通过用户名获取用户
            user = User.objects.get(username=username_param)
            # 手动设置 request.user（仅用于本次请求）
            request.user = user
            print(f"通过参数获取用户: {username_param}")
        except User.DoesNotExist:
            print(f"用户不存在: {username_param}")
            # 返回默认菜单
            return get_default_menus_response()

    # ✅ 如果仍未认证，返回默认菜单
    if not request.user.is_authenticated:
        print("用户未认证，返回默认菜单")
        return get_default_menus_response()

    # 打印调试信息
    print(f"获取菜单，用户: {request.user.username}, 认证状态: {request.user.is_authenticated}")

    try:
        # 菜单结构定义
        all_menus = {
            'dashboard': {
                'name': '概览',
                'icon': 'glyphicon-dashboard',
                'url': './page/home/home.html',
                'children': []
            },
            'data_editing': {
                'name': '数据编辑',
                'icon': 'glyphicon-edit',
                'children': [
                    {'name': '日常收支', 'url': './page/edit/DailyInout.html'}
                ]
            },
            'views': {
                'name': '视图',
                'icon': 'glyphicon-eye-open',
                'children': [
                    {'name': '日视图', 'url': './page/views/DayView.html'},
                    {'name': '月视图', 'url': './page/views/MonthView.html'},
                    {'name': '年视图', 'url': './page/views/AroundYearView.html'}
                ]
            },
            'configuration': {
                'name': '配置',
                'icon': 'glyphicon-wrench',
                'children': [
                    {'name': '基础类型', 'url': './page/bases/SpendType.html'},
                    {'name': '收支类型', 'url': './page/bases/ExpenseDetailsType.html'}
                ]
            },
            'metrics': {
                'name': '指标',
                'icon': 'glyphicon-stats',
                'children': [
                    {'name': '检测指标', 'url': './page/edit/DetectionMetrics.html'}
                ]
            },
            'manager': {
                'name': '管理',
                'icon': 'glyphicon-folder-close',
                'children': [
                    {'name': '所有用户', 'url': './page/manager/users.html'},
                    {'name': '权限管理', 'url': './page/manager/pages_permission.html'}
                ]
            }
        }

        # 权限检查函数
        def has_permission(menu_key):
            if request.user.is_superuser:
                return True

            # 检查用户是否属于管理员组
            if request.user.groups.filter(name__in=['管理员', 'admin']).exists():
                return True

            # 根据菜单key检查权限
            permission_map = {
                'manager': ['auth.view_user', 'auth.view_group'],
                'configuration': ['auth.view_permission'],
                'data_editing': ['dailyinout.view_dailyinout'],
                'metrics': ['metrics.view_metrics'],
                'views': ['overview.view_overview'],
            }

            if menu_key in permission_map:
                for perm in permission_map[menu_key]:
                    if request.user.has_perm(perm):
                        return True
                return False

            return True  # 默认允许

        # 过滤菜单
        filtered_menus = []
        for key, menu in all_menus.items():
            if has_permission(key):
                filtered_menus.append({
                    'key': key,
                    'name': menu['name'],
                    'icon': menu.get('icon', ''),
                    'url': menu.get('url', ''),
                    'children': menu.get('children', [])
                })

        return JsonResponse({
            'code': '1',
            'msg': 'success',
            'data': filtered_menus
        })
    except Exception as e:
        print(f"获取菜单异常: {e}")
        return JsonResponse({'code': '0', 'msg': str(e)})


def get_default_menus_response():
    """返回默认菜单"""
    default_menus = [
        {'key': 'dashboard', 'name': '概览', 'icon': 'glyphicon-dashboard',
         'url': './page/home/home.html', 'children': []},
        {'key': 'data_editing', 'name': '数据编辑', 'icon': 'glyphicon-edit',
         'children': [{'name': '日常收支', 'url': './page/edit/DailyInout.html'}]},
        {'key': 'views', 'name': '视图', 'icon': 'glyphicon-eye-open',
         'children': [
             {'name': '日视图', 'url': './page/views/DayView.html'},
             {'name': '月视图', 'url': './page/views/MonthView.html'},
             {'name': '年视图', 'url': './page/views/AroundYearView.html'}
         ]},
        {'key': 'configuration', 'name': '配置', 'icon': 'glyphicon-wrench',
         'children': [
             {'name': '基础类型', 'url': './page/bases/SpendType.html'},
             {'name': '收支类型', 'url': './page/bases/ExpenseDetailsType.html'}
         ]},
        {'key': 'metrics', 'name': '指标', 'icon': 'glyphicon-stats',
         'children': [{'name': '检测指标', 'url': './page/edit/DetectionMetrics.html'}]}
    ]
    return JsonResponse({
        'code': '1',
        'msg': 'success',
        'data': default_menus
    })