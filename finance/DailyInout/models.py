from tabnanny import verbose
from django.db import models
import django.utils.timezone as timezone
from django.contrib.auth.models import User

# Create your models here.
from Infrastructure.models import Code, Status

class Dailyinout(models.Model):
    codecodes = models.ManyToManyField(to=Code, verbose_name="科目", related_name='Code_codes', blank=False)
    counterparty = models.CharField(verbose_name="交易对方", max_length=100, null=True, blank=True)
    tradeName = models.CharField(verbose_name="商品名称", max_length=100, null=True, blank=True)
    accountingSerialNmbe = models.CharField(verbose_name="账务流水号", max_length=100, null=True, blank=True)
    businesSserialNumbe = models.CharField(verbose_name="业务流水号", max_length=100, null=True, blank=True)
    merchantOrderNumbe = models.CharField(verbose_name="商户订单号", max_length=100, null=True, blank=True)
    transactionNo = models.CharField(verbose_name="交易单号", max_length=100, null=True, blank=True)
    transactionChannel = models.CharField(verbose_name="交易渠道", max_length=100, null=True, blank=True)
    businessType = models.CharField(verbose_name="业务类型", max_length=100, null=True, blank=True)
    consumer = models.CharField(verbose_name="消费者", max_length=100, null=True, blank=True)
    money = models.DecimalField(verbose_name="金额", max_digits=8, decimal_places=2, null=False, blank=False)
    inoutdate = models.DateTimeField(verbose_name="时间", null=False, blank=False, default=timezone.now)
    creatorcode = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='DailyinoutUser', verbose_name="创建人", null=False, blank=False)
    createtime = models.DateTimeField(
        verbose_name="创建时间", null=False, blank=False, default=timezone.now)
    updatetime = models.DateTimeField(
        verbose_name="创建时间", null=True, blank=True, auto_now=True)
    validind = models.TextField(
        verbose_name="1:有效 0:无效", max_length=1, choices=Status.choices, default=Status.EFFECTIVE)
    remark = models.TextField(
        verbose_name="备注", max_length=4000, null=True, blank=True)

    def __str__(self) -> str:
        return self.tradeName

    class Meta:
        ordering = ["createtime"]
        db_table = 'dailyinout'
        verbose_name = "dailyinout"
        verbose_name_plural = 'dailyinouts'