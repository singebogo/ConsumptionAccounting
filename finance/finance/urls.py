'''
Author: singebogo
Date: 2022-09-13 10:42:44
LastEditors: singebogo
LastEditTime: 2022-09-23 15:19:41
Description: 
'''
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
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('infrastruct/', include('Infrastructure.urls')),
    path('Authlogin/', include('Authlogin.urls')),
    path('DailyInout/', include('DailyInout.urls')),
    path('DataPresentation/', include('DataPresentation.urls')),
    path('Metrics/', include('Metrics.urls')),
    path('Overview/', include('Overview.urls')),
]
