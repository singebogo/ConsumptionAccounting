# Authlogin/management/commands/init_permissions.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission


class Command(BaseCommand):
    help = '初始化系统权限和角色'

    def handle(self, *args, **options):
        # 创建管理员组
        admin_group, created = Group.objects.get_or_create(name='管理员')

        # 给管理员组所有权限
        all_perms = Permission.objects.all()
        admin_group.permissions.set(all_perms)

        # 创建普通用户组
        user_group, created = Group.objects.get_or_create(name='普通用户')

        self.stdout.write(self.style.SUCCESS('权限初始化完成'))