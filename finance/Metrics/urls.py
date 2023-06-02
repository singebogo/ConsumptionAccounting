'''
Author: singebogo
Date: 2022-09-22 14:32:46
LastEditors: singebogo
LastEditTime: 2022-09-22 17:36:44
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
from django.urls import path
from .views import *

urlpatterns = [
    path('MetricsAll/', MetricsAll),
    path('MetricsDelete/',MetricsDelete),
    # path('MetricsQueryPrimary/',MetricsQueryPrimary),
    path('MetricsChange/',MetricsChange),
    # path('MetricsIsExist/',MetricsIsExist),
    path('limitTypeMetrics/',limitTypeMetrics),
    
]
