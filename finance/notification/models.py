from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class NotificationType(models.TextChoices):
    """通知类型"""
    SYSTEM = 'SYSTEM', '系统公告'
    BUDGET = 'BUDGET', '预算预警'
    IMPORT = 'IMPORT', '导入完成'
    AUDIT = 'AUDIT', '审核通知'
    TASK = 'TASK', '任务提醒'
    OTHER = 'OTHER', '其他'


class NotificationPriority(models.TextChoices):
    """通知优先级"""
    LOW = 'LOW', '低'
    MEDIUM = 'MEDIUM', '中'
    HIGH = 'HIGH', '高'
    URGENT = 'URGENT', '紧急'


class Notification(models.Model):
    """通知主表"""
    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容')
    type = models.CharField('类型', max_length=20,
                            choices=NotificationType.choices,
                            default=NotificationType.SYSTEM)
    priority = models.CharField('优先级', max_length=20,
                                choices=NotificationPriority.choices,
                                default=NotificationPriority.MEDIUM)

    # 发送范围
    sender = models.ForeignKey(User, on_delete=models.SET_NULL,
                               null=True, blank=True, related_name='sent_notifications',
                               verbose_name='发送者')
    is_public = models.BooleanField('是否全员发送', default=False)

    # 附加数据（存储JSON格式的额外信息）
    extra_data = models.JSONField('附加数据', default=dict, blank=True)

    # 链接跳转
    link_url = models.CharField('链接地址', max_length=500, blank=True)
    link_text = models.CharField('链接文字', max_length=100, default='查看详情')

    # 时间戳
    created_at = models.DateTimeField('创建时间', default=timezone.now)
    expires_at = models.DateTimeField('过期时间', null=True, blank=True)

    class Meta:
        db_table = 'notification'
        verbose_name = '通知'
        verbose_name_plural = '通知'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['type', 'priority']),
        ]

    def __str__(self):
        return f'[{self.get_type_display()}] {self.title}'

    def is_expired(self):
        """是否已过期"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class UserNotification(models.Model):
    """用户通知关联表（记录每个用户的接收状态）"""
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='notifications',
                             verbose_name='用户')
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE,
                                     related_name='user_notifications',
                                     verbose_name='通知')

    is_read = models.BooleanField('是否已读', default=False)
    is_deleted = models.BooleanField('是否删除', default=False)
    read_at = models.DateTimeField('阅读时间', null=True, blank=True)

    created_at = models.DateTimeField('接收时间', auto_now_add=True)

    class Meta:
        db_table = 'user_notification'
        verbose_name = '用户通知'
        verbose_name_plural = '用户通知'
        unique_together = ['user', 'notification']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read', 'is_deleted']),
        ]

    def mark_as_read(self):
        """标记为已读"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save()

    def __str__(self):
        return f'{self.user.username} - {self.notification.title}'


class Message(models.Model):
    """站内消息（私信）"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE,
                               related_name='sent_messages',
                               verbose_name='发件人')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE,
                                  related_name='received_messages',
                                  verbose_name='收件人')

    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容')

    # 附件
    attachment = models.FileField('附件', upload_to='messages/%Y/%m/',
                                  null=True, blank=True)
    attachment_name = models.CharField('附件名称', max_length=255, blank=True)

    # 状态
    is_read = models.BooleanField('是否已读', default=False)
    is_starred = models.BooleanField('是否标星', default=False)
    is_deleted_by_sender = models.BooleanField('发件人是否删除', default=False)
    is_deleted_by_recipient = models.BooleanField('收件人是否删除', default=False)

    # 时间
    sent_at = models.DateTimeField('发送时间', default=timezone.now)
    read_at = models.DateTimeField('阅读时间', null=True, blank=True)

    # 回复关联
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL,
                                       null=True, blank=True,
                                       related_name='replies',
                                       verbose_name='回复消息')

    class Meta:
        db_table = 'message'
        verbose_name = '站内消息'
        verbose_name_plural = '站内消息'
        ordering = ['-sent_at']

    def __str__(self):
        return f'{self.sender.username} → {self.recipient.username}: {self.title[:20]}'

    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class MessageAttachment(models.Model):
    """消息附件表（支持多附件）"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE,
                                related_name='attachments',
                                verbose_name='消息')
    file = models.FileField('文件', upload_to='message_attachments/%Y/%m/')
    filename = models.CharField('文件名', max_length=255)
    file_size = models.IntegerField('文件大小', default=0)
    file_type = models.CharField('文件类型', max_length=100, blank=True)

    uploaded_at = models.DateTimeField('上传时间', auto_now_add=True)

    class Meta:
        db_table = 'message_attachment'
