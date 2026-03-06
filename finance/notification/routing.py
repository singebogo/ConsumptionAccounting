# your_project/routing.py

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path
from . import consumers  # 导入你的consumer

# WebSocket URL路由
websocket_urlpatterns = [
    # 你的NotificationConsumer的URL路由
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
    # 如果需要带参数的路由
    # re_path(r'ws/notifications/(?P<user_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # HTTP请求处理
    "websocket": AuthMiddlewareStack(  # WebSocket请求处理
        URLRouter(
            websocket_urlpatterns
        )
    ),
})