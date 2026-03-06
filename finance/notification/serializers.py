from rest_framework import serializers
from .models import Notification, UserNotification, Message
from django.contrib.auth.models import User


class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单序列化 - 安全处理"""

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class NotificationSerializer(serializers.ModelSerializer):
    """通知序列化器"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'content', 'type', 'type_display',
            'priority', 'priority_display', 'sender', 'sender_name',
            'is_public', 'extra_data', 'link_url', 'link_text',
            'created_at', 'expires_at'
        ]

    def get_sender_name(self, obj):
        """安全获取发送者用户名"""
        if obj.sender:
            return obj.sender.username
        return '系统'


class UserNotificationSerializer(serializers.ModelSerializer):
    """用户通知序列化器 - 修复AnonymousUser错误"""
    notification = NotificationSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = [
            'id', 'notification', 'is_read', 'read_at',
            'created_at', 'time_ago'
        ]

    def get_time_ago(self, obj):
        """计算时间差"""
        from django.utils import timezone
        delta = timezone.now() - obj.created_at

        if delta.days > 0:
            return f'{delta.days}天前'
        elif delta.seconds > 3600:
            return f'{delta.seconds // 3600}小时前'
        elif delta.seconds > 60:
            return f'{delta.seconds // 60}分钟前'
        else:
            return '刚刚'


class MessageSerializer(serializers.ModelSerializer):
    """消息序列化器"""
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'title', 'content', 'sender', 'sender_name', 'sender_avatar',
            'recipient', 'recipient_name', 'is_read', 'is_starred',
            'attachment', 'attachment_name', 'sent_at', 'read_at', 'time_ago'
        ]

    def get_sender_name(self, obj):
        """安全获取发送者用户名"""
        if obj.sender:
            return obj.sender.username
        return '系统'

    def get_recipient_name(self, obj):
        """安全获取接收者用户名"""
        if obj.recipient:
            return obj.recipient.username
        return '未知'

    def get_sender_avatar(self, obj):
        """获取发送者头像"""
        if obj.sender:
            return f'/static/img/avatars/default_{obj.sender.id % 10}.png'
        return '/static/img/avatars/default_0.png'

    def get_time_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.sent_at
        if delta.days > 0:
            return f'{delta.days}天前'
        elif delta.seconds > 3600:
            return f'{delta.seconds // 3600}小时前'
        else:
            return f'{delta.seconds // 60}分钟前'