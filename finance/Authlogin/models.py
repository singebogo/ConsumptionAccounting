from django.db import models

from django.db import models
from django.contrib.auth.models import User, Group, Permission
from django.utils import timezone


class MenuPermission(models.Model):
    """
    菜单权限表 - 定义系统所有菜单项
    """
    MENU_TYPES = (
        ('dashboard', '仪表盘'),
        ('data_editing', '数据编辑'),
        ('views', '视图'),
        ('configuration', '配置'),
        ('metrics', '指标'),
        ('manager', '管理'),
        ('system', '系统'),
        ('custom', '自定义'),
    )

    ICON_CHOICES = (
        ('glyphicon-dashboard', '仪表盘'),
        ('glyphicon-edit', '编辑'),
        ('glyphicon-eye-open', '视图'),
        ('glyphicon-wrench', '配置'),
        ('glyphicon-stats', '统计'),
        ('glyphicon-folder-close', '文件夹'),
        ('glyphicon-cog', '设置'),
        ('glyphicon-user', '用户'),
        ('glyphicon-file', '文件'),
        ('glyphicon-puzzle-piece', '拼图'),
        ('glyphicon-list-alt', '列表'),
        ('glyphicon-calendar', '日历'),
        ('glyphicon-time', '时间'),
        ('glyphicon-globe', '全球'),
        ('glyphicon-tasks', '任务'),
        ('glyphicon-comment', '评论'),
        ('glyphicon-envelope', '邮件'),
        ('glyphicon-bell', '通知'),
        ('glyphicon-send', '发送'),
        ('glyphicon-star', '星标'),
        ('glyphicon-lock', '锁定'),
    )

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name='父菜单'
    )
    name = models.CharField(max_length=50, verbose_name='菜单名称')
    key = models.CharField(max_length=50, unique=True, verbose_name='菜单标识')
    icon = models.CharField(max_length=50, blank=True, choices=ICON_CHOICES, verbose_name='图标')
    url = models.CharField(max_length=200, blank=True, verbose_name='链接地址')
    menu_type = models.CharField(max_length=20, choices=MENU_TYPES, default='custom', verbose_name='菜单类型')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    is_public = models.BooleanField(default=False, verbose_name='是否公开（无需权限）')

    # 关联的 Django 权限（用于细粒度控制）
    required_permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name='menu_permissions',
        verbose_name='所需权限'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'auth_menu_permission'
        verbose_name = '菜单权限'
        verbose_name_plural = '菜单权限'
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.name} ({self.key})'

    def get_children(self):
        """获取子菜单"""
        return self.children.filter(is_active=True).order_by('order')

    def get_all_children_ids(self):
        """获取所有子菜单ID"""
        ids = []
        for child in self.children.filter(is_active=True):
            ids.append(child.id)
            ids.extend(child.get_all_children_ids())
        return ids

    def has_child(self):
        """是否有子菜单"""
        return self.children.filter(is_active=True).exists()

    @classmethod
    def get_menu_tree(cls, user=None):
        """获取菜单树"""
        if user and user.is_superuser:
            # 超级管理员看到所有菜单
            return cls.objects.filter(parent__isnull=True, is_active=True).order_by('order')

        # 根据用户权限过滤菜单
        # 这里需要结合用户组权限来实现
        return cls.objects.filter(parent__isnull=True, is_active=True, is_public=True).order_by('order')


class RoleGroup(models.Model):
    """
    角色组 - 扩展 Django Group
    """
    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='role_group',
        verbose_name='Django组'
    )
    name = models.CharField(max_length=50, verbose_name='角色名称')
    description = models.TextField(blank=True, verbose_name='角色描述')
    is_system = models.BooleanField(default=False, verbose_name='是否系统角色（不可删除）')

    # 关联的菜单权限（角色可以看到哪些菜单）
    menu_permissions = models.ManyToManyField(
        MenuPermission,
        blank=True,
        related_name='role_groups',
        verbose_name='菜单权限'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'auth_role_group'
        verbose_name = '角色组'
        verbose_name_plural = '角色组'

    def __str__(self):
        return self.name

    def get_menu_tree(self):
        """获取该角色可访问的菜单树"""
        menus = self.menu_permissions.filter(parent__isnull=True, is_active=True).order_by('order')
        return menus

    def has_menu_permission(self, menu_key):
        """检查是否有某个菜单的权限"""
        return self.menu_permissions.filter(key=menu_key, is_active=True).exists()

    def get_all_menu_keys(self):
        """获取所有菜单标识"""
        return list(self.menu_permissions.filter(is_active=True).values_list('key', flat=True))

    def get_user_count(self):
        """获取该角色下的用户数量"""
        return self.group.user_set.count()


class UserRole(models.Model):
    """
    用户角色关联表 - 为用户分配角色
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles',
        verbose_name='用户'
    )
    role_group = models.ForeignKey(
        RoleGroup,
        on_delete=models.CASCADE,
        related_name='user_roles',
        verbose_name='角色组'
    )
    is_active = models.BooleanField(default=True, verbose_name='是否生效')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='分配时间')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_roles',
        verbose_name='分配人'
    )

    class Meta:
        db_table = 'auth_user_role'
        verbose_name = '用户角色'
        verbose_name_plural = '用户角色'
        unique_together = ['user', 'role_group']

    def __str__(self):
        return f'{self.user.username} - {self.role_group.name}'


class UserPermission(models.Model):
    """
    用户独立权限表 - 用于给用户单独分配额外权限（不通过角色）
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='extra_permissions',
        verbose_name='用户'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='user_permissions',
        verbose_name='权限'
    )
    menu_permission = models.ForeignKey(
        MenuPermission,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_permissions',
        verbose_name='菜单权限'
    )
    is_granted = models.BooleanField(default=True, verbose_name='是否授权')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_permissions',
        verbose_name='授权人'
    )

    class Meta:
        db_table = 'auth_user_permission'
        verbose_name = '用户权限'
        verbose_name_plural = '用户权限'
        unique_together = ['user', 'permission']

    def __str__(self):
        return f'{self.user.username} - {self.permission.name}'


class OperationLog(models.Model):
    """
    操作日志表 - 记录权限变更操作
    """
    ACTION_TYPES = (
        ('create', '创建'),
        ('update', '更新'),
        ('delete', '删除'),
        ('assign', '分配'),
        ('revoke', '撤销'),
    )

    OPERATION_TARGETS = (
        ('role', '角色'),
        ('user_role', '用户角色'),
        ('menu_permission', '菜单权限'),
        ('user_permission', '用户权限'),
        ('user', '用户'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='operation_logs',
        verbose_name='操作人'
    )
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name='操作类型')
    target_type = models.CharField(max_length=20, choices=OPERATION_TARGETS, verbose_name='操作目标类型')
    target_id = models.IntegerField(verbose_name='操作目标ID')
    target_name = models.CharField(max_length=100, blank=True, verbose_name='操作目标名称')

    old_value = models.TextField(blank=True, verbose_name='旧值')
    new_value = models.TextField(blank=True, verbose_name='新值')

    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP地址')
    user_agent = models.TextField(blank=True, verbose_name='用户代理')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='操作时间')

    class Meta:
        db_table = 'auth_operation_log'
        verbose_name = '操作日志'
        verbose_name_plural = '操作日志'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.get_action_type_display()} - {self.target_name}'
