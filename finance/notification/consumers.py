# notification/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Notification, UserNotification


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket通知消费者"""

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_authenticated:
            # 加入用户专属频道组
            self.group_name = f'user_{self.user.id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
            print(f"WebSocket connected for user {self.user.id}")  # 添加调试信息
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            print(f"WebSocket disconnected for user {self.user.id}")

    async def receive(self, text_data):
        """接收客户端消息"""
        data = json.loads(text_data)
        command = data.get('command')

        if command == 'mark_read':
            success = await self.mark_notification_read(data.get('notification_id'))
            # 回复确认
            await self.send(text_data=json.dumps({
                'type': 'mark_read_response',
                'success': success,
                'notification_id': data.get('notification_id')
            }))

    async def notification_message(self, event):
        """发送通知"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['data']
        }))

    async def message_notification(self, event):
        """发送消息提醒"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event['data']
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """标记通知已读"""
        try:
            notification = UserNotification.objects.get(
                id=notification_id,
                user=self.user
            )
            notification.mark_as_read()
            return True
        except UserNotification.DoesNotExist:
            return False