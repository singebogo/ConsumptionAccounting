from django.db import models
import django.utils.timezone as timezone
from django.contrib.auth.models import User

# Create your models here.


class Status(models.TextChoices):
    VOID = '0', "无效"
    EFFECTIVE = '1', "有效"


class Codetype(models.Model):
    codetype = models.CharField(
        verbose_name="代码类型", primary_key=True, max_length=100, null=False, blank=False)
    codename = models.TextField(
        verbose_name="代码描述", max_length=400, null=True, blank=True)
    creatorcode = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='CodetypeUser',  verbose_name="创建人", null=False, blank=False)
    createtime = models.DateTimeField(
        verbose_name="创建时间", null=False, blank=False, default=timezone.now)
    updatetime = models.DateTimeField(
        verbose_name="创建时间", null=True, blank=True, auto_now=True)
    validdate = models.DateTimeField(
        verbose_name="生效时间", null=False, blank=False)
    invaliddate = models.DateTimeField(
        verbose_name="失效时间", null=False, blank=False)
    validind = models.TextField(
        verbose_name="1:有效 0:无效", null=False, blank=False, max_length=1, choices=Status.choices, default=Status.EFFECTIVE)
    remark = models.TextField(
        verbose_name="备注", max_length=4000, null=True, blank=True)

    def __str__(self) -> str:
        return self.codetype

    class Meta:
        ordering = ["createtime"]
        db_table = 'codetype'
        verbose_name = "codetype"
        verbose_name_plural = 'codetypes'


class Code(models.Model):
    codetype = models.ForeignKey(
        Codetype, on_delete=models.CASCADE, related_name='Codetype')
    codecode = models.CharField(
        verbose_name="业务代码", primary_key=True, max_length=100, null=False, blank=False
    )
    codename = models.TextField(
        verbose_name="业务代码含义", max_length=400, null=False, blank=False
    )
    creatorcode = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='CodeUser',  verbose_name="创建人", null=False, blank=False)
    createtime = models.DateTimeField(
        verbose_name="创建时间", null=False, blank=False, default=timezone.now)
    updatetime = models.DateTimeField(
        verbose_name="创建时间", null=True, blank=True, auto_now=True)
    validdate = models.DateTimeField(
        verbose_name="生效时间", null=False, blank=False)
    invaliddate = models.DateTimeField(
        verbose_name="失效时间", null=False, blank=False)
    validind = models.TextField(
        verbose_name="1:有效 0:无效", max_length=1, choices=Status.choices, default=Status.EFFECTIVE)
    remark = models.TextField(
        verbose_name="备注", max_length=4000, null=True, blank=True)

    def __str__(self) -> str:
        return self.codecode

    class Meta:
        ordering = ["createtime"]
        db_table = 'code'
        verbose_name = "code"
        verbose_name_plural = 'codes'
