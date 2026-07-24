# finance/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance.settings')


# 自定义 Origin 验证（允许所有）
class AllowAllOriginValidator:
    def __init__(self, application):
        self.application = application

    async def __call__(self, scope, receive, send):
        # 允许所有 Origin，不做验证
        return await self.application(scope, receive, send)


application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowAllOriginValidator(  # ✅ 使用自定义验证器
        AuthMiddlewareStack(
            URLRouter(
                routing.websocket_urlpatterns
            )
        )
    ),
})