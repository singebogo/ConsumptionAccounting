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
    path('api/users/', views.user_list, name='user_list'),
    path('api/users/<int:user_id>/', views.user_detail, name='user_detail'),
]
