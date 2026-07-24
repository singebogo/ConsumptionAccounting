"""finance URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.Authlogin, name='login'),
    path('logout/', views.Authlogout, name='logout'),
    path('reg/', views.reg_view, name='register'),  # 注册接口
    path('api/user/info/', views.user_info, name='user_info'),  # 注册接口

    path('api/users/search/', views.user_search, name='user_search'),
    path('api/users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('api/users/', views.user_list, name='user_list'),
    path('api/users/create/', views.user_create, name='user_create'),
    path('api/users/update/', views.user_update, name='user_update'),
    path('api/users/delete/', views.user_delete, name='user_delete'),
    path('api/users/reset-password/', views.user_reset_password, name='user_reset_password'),

    # 角色管理
    path('api/roles/', views.role_list, name='role_list'),
    path('api/roles/create/', views.role_create, name='role_create'),
    path('api/roles/update/', views.role_update, name='role_update'),
    path('api/roles/delete/', views.role_delete, name='role_delete'),

    # 权限列表
    path('api/permissions/', views.permission_list, name='permission_list'),

    # 用户角色分配
    path('api/users/assign-role/', views.user_assign_role, name='user_assign_role'),
    path('api/users/<int:user_id>/roles/', views.user_get_roles, name='user_get_roles'),

    # 用户菜单
    path('api/user/menus/', views.get_user_menus, name='get_user_menus'),
    path('api/roles/all/', views.role_list_all, name='role_list_all'),
]
