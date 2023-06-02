'''
Author: singebogo
Date: 2022-09-22 14:31:51
LastEditors: singebogo
LastEditTime: 2022-09-23 08:52:20
Description: 
'''
import imp
from pyexpat import model
from statistics import mode
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from Infrastructure.models import Code, Status


class limitType(models.TextChoices):
    DAY = '0',
    MONTH = '1',
    YEAR = '2',

class sumLimitType(models.TextChoices):
    NO = '0',
    YES = '1',

class DetectionMetrics(models.Model):
    codecodes = models.ManyToManyField(
        to=Code, verbose_name="科目", related_name='Metrics_codes', blank=False)
    limittype = models.TextField(verbose_name="year month day 类型",
                                 max_length=1, choices=limitType.choices, default=limitType.DAY)
    sumlimittype = models.TextField(verbose_name="bsum 类型",
                                 max_length=1, choices=sumLimitType.choices, default=sumLimitType.NO)
    limit = models.DecimalField(
        verbose_name="限额", max_digits=8, decimal_places=2, null=False, blank=False)
    style = models.TextField(
        verbose_name="样式", max_length=4000, null=False, blank=False)
    creatorcode = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='MetricsUser', verbose_name="创建人", null=False, blank=False)
    createtime = models.DateTimeField(
        verbose_name="创建时间", null=False, blank=False, default=timezone.now)
    updatetime = models.DateTimeField(
        verbose_name="创建时间", null=True, blank=True, auto_now=True)
    validind = models.TextField(
        verbose_name="1:有效 0:无效", max_length=1, choices=Status.choices, default=Status.EFFECTIVE)
    remark = models.TextField(
        verbose_name="备注", max_length=4000, null=True, blank=True)

    def __str__(self) -> str:
        return self.codecodes

    class Meta:
        ordering = ["createtime"]
        db_table = 'detectionmetrics'
        verbose_name = "detectionmetrics"
        verbose_name_plural = 'detectionmetrics'
