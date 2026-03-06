from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notification.models import Notification, UserNotification
from django.utils import timezone


class Command(BaseCommand):
    help = '发送系统通知'

    def add_arguments(self, parser):
        parser.add_argument('--title', type=str, help='通知标题')
        parser.add_argument('--content', type=str, help='通知内容')
        parser.add_argument('--type', type=str, default='SYSTEM', help='通知类型')
        parser.add_argument('--priority', type=str, default='MEDIUM', help='优先级')
        parser.add_argument('--user', type=str, help='指定用户(用户名)')

    def handle(self, *args, **options):
        title = options.get('title') or '系统维护通知'
        content = options.get('content') or '系统将于今晚02:00-04:00进行例行维护'
        type_ = options.get('type')
        priority = options.get('priority')
        username = options.get('user')

        # 创建通知
        notification = Notification.objects.create(
            title=title,
            content=content,
            type=type_,
            priority=priority,
            is_public=not bool(username),
            expires_at=timezone.now() + timezone.timedelta(days=7)
        )

        # 发送给用户
        if username:
            try:
                user = User.objects.get(username=username)
                UserNotification.objects.create(
                    user=user,
                    notification=notification
                )
                self.stdout.write(self.style.SUCCESS(f'成功发送通知给 {username}'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'用户 {username} 不存在'))
        else:
            users = User.objects.filter(is_active=True)
            for user in users:
                UserNotification.objects.create(
                    user=user,
                    notification=notification
                )
            self.stdout.write(self.style.SUCCESS(f'成功发送通知给 {users.count()} 个用户'))