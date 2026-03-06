# finance/asgi.py
"""
ASGI config for finance project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance.settings')

application = get_asgi_application()

#
# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.security.websocket import AllowedHostsOriginValidator
# from django.urls import re_path
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance.settings')
#
# # 先获取 Django 的 ASGI 应用
# django_asgi_app = get_asgi_application()
#
# # 在这里导入 consumers（必须在设置环境变量之后）
# try:
#     from notification import consumers
# except ImportError:
#     # 如果 notification 应用不存在，先创建一个占位
#     print("Warning: notification app not found, websocket routes will be empty")
#     consumers = None
#
# # 配置 WebSocket 路由
# websocket_urlpatterns = []
#
# if consumers:
#     websocket_urlpatterns = [
#         re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
#     ]
#
# # 配置 ASGI 应用
# application = ProtocolTypeRouter({
#     # HTTP 请求由 Django 处理
#     "http": django_asgi_app,
#
#     # WebSocket 请求由 Channels 处理
#     "websocket": AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     ),
# })