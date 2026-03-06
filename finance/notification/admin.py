from django.contrib import admin
from django.utils.html import format_html
from .models import Notification, UserNotification, Message


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_preview', 'type', 'priority', 'sender', 'is_public', 'created_at', 'expires_at']
    list_filter = ['type', 'priority', 'is_public', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'content', 'type', 'priority')
        }),
        ('发送范围', {
            'fields': ('sender', 'is_public')
        }),
        ('附加设置', {
            'fields': ('extra_data', 'link_url', 'link_text')
        }),
        ('时间设置', {
            'fields': ('created_at', 'expires_at')
        }),
    )

    def title_preview(self, obj):
        if len(obj.title) > 30:
            return obj.title[:30] + '...'
        return obj.title

    title_preview.short_description = '标题'

    def save_model(self, request, obj, form, change):
        if not obj.sender:
            obj.sender = request.user
        super().save_model(request, obj, form, change)

        # 创建用户通知关联
        if obj.is_public:
            from django.contrib.auth.models import User
            users = User.objects.filter(is_active=True)
            for user in users:
                UserNotification.objects.get_or_create(
                    user=user,
                    notification=obj
                )


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_title', 'is_read', 'read_at', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['user__username', 'notification__title']
    readonly_fields = ['created_at', 'read_at']

    def notification_title(self, obj):
        return obj.notification.title

    notification_title.short_description = '通知标题'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'recipient', 'title_preview', 'is_read', 'is_starred', 'sent_at']
    list_filter = ['is_read', 'is_starred', 'sent_at']
    search_fields = ['sender__username', 'recipient__username', 'title', 'content']
    readonly_fields = ['sent_at', 'read_at']

    def title_preview(self, obj):
        if len(obj.title) > 20:
            return obj.title[:20] + '...'
        return obj.title

    title_preview.short_description = '标题'