import re
from django.db import transaction
from django.http.response import HttpResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from ast import literal_eval


# Create your views here.
from .models import Dailyinout
from Infrastructure.models import Code

import json

def status(validind):
    # 状态处理
    if validind == '*':
        validind = ['0', '1']
    elif validind == '0':
        validind = ['0']
    elif validind == '1':
        validind = ['1']
    else:
        validind = ['0', '1']
    return validind


@csrf_exempt
def DailyinoutAll(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetypeQuery")
        codecode = request.POST.get("codecodeQuery")
        money = request.POST.get("moneyQuery")
        validind = request.POST.get("validindQuery")
        startdateQuery = request.POST.get("startdateQuery")
        enddateQuery = request.POST.get("enddateQuery")

        # 状态处理
        validind = status(validind)

        Dailyinoutobj = Dailyinout.objects.filter(validind__in=validind)

        if (codecode):
            Dailyinoutobj = Dailyinoutobj.filter(codecodes=codecode)
        if (codetype):
            Dailyinoutobj = Dailyinoutobj.filter(codecodes__codetype=codetype)                
        if (startdateQuery):
            Dailyinoutobj = Dailyinoutobj.filter(inoutdate__gte=startdateQuery)
        if (enddateQuery):
            Dailyinoutobj = Dailyinoutobj.filter(inoutdate__lte=enddateQuery)
        if (money):
            Dailyinoutobj = Dailyinoutobj.filter(money=money)               

        # 获取外键数据
        Dailyinoutobj = Dailyinoutobj.values('id',
                    'codecodes__codetype', 'codecodes', 'money', 'inoutdate',
                     'creatorcode', 'createtime', 'updatetime', 'validind', 'remark',)
        serialized_q = json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)
        return HttpResponse(serialized_q)
    return None


@csrf_exempt
def blukCreate(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        datas = json.loads(request.POST.get("data"))

        keys = ("inoutdate", "counterparty", "tradeName", "accountingSerialNmbe", "businesSserialNumbe",
                "merchantOrderNumbe", "transactionNo", "money", "transactionChannel", "businessType",
                "remark", "consumer", "codecodes", "creatorcode", "createtime", "validind")
        kwargsDict = [dict(zip(keys, value)) for value in datas]

        # 使用事务，确保所有操作要么全部成功，要么全部失败
        try:
            with transaction.atomic():
                for kwarg in kwargsDict:
                    # 获取用户对象
                    kwarg["creatorcode"] = User.objects.get(pk=kwarg["creatorcode"])

                    # 获取codecode并移除
                    codecode = kwarg["codecodes"]
                    del kwarg["codecodes"]

                    # 检查Code是否存在
                    try:
                        codecodes_obj = Code.objects.get(codecode=codecode)
                    except Code.DoesNotExist:
                        data = {"code": '0', "msg": "{} 不存在".format(codecode)}
                        return HttpResponse(json.dumps(data))

                    # 创建Dailyinout对象
                    dailuinoutObj = Dailyinout.objects.create(**kwarg)

                    # 设置多对多关系
                    dailuinoutObj.codecodes.set([codecodes_obj])

                # 所有数据都成功处理
                data = {"code": '1', "msg": "批量创建成功，共 {} 条".format(len(kwargsDict))}

        except Exception as err:
            # 发生异常时，事务会自动回滚
            data = {"code": '0', "msg": "批量创建失败: {}".format(err)}

        return HttpResponse(json.dumps(data))

    return None


@csrf_exempt
def DailyinoutDelete(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("pk")
        if (not id):
            return HttpResponse(json.dumps({"code": '0', "msg": "主键不能为空", }))
        else:
            obj = Dailyinout.objects.filter(id=id).delete()
            return HttpResponse(json.dumps({"code": '1', "msg": "{} 删除成功".format(id), }))
    return None


@csrf_exempt
def DailyinoutChange(request):
    global data
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("id")
        codecodes = request.POST.get("codecodes")
        money = request.POST.get("money")
        inoutdate = request.POST.get("inoutdate")
        creatorcode = request.POST.get("creatorcode")
        createtime = request.POST.get("createtime")
        updatetime = request.POST.get("updatetime")
        validind = request.POST.get("validind")
        remark = request.POST.get("remark")

        if (not codecodes or not validind or not money):
            msg = "codecode: {} or validind: {} or money:{} is null".format(codecodes, validind, money)
            return HttpResponse({"code": '0', "msg": msg})
        else:
            user = User.objects.get(pk=creatorcode)
            try:
                codecodes = Code.objects.get(codecode=codecodes)
            except Exception as err:
                data = {"code": '0', "msg": "{} 不存在, {}".format(codecodes, err), }
                return HttpResponse(json.dumps(data))
            num = 0
            if(id):
                num = Dailyinout.objects.filter(id=id).count()
            if (num != 0):
                try:
                    obj = Dailyinout.objects.get(id=id)
                    obj.money =money
                    obj.inoutdate =inoutdate
                    obj.creatorcode = user
                    obj.updatetime = updatetime
                    obj.validind = validind
                    obj.remark = remark
                    obj.save()
                    obj.codecodes.set([codecodes])
                    data = {"code": '1', "msg": "更新成功", }
                except Exception as err:
                    print(err)
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))                
            else:
                try:
                    obj = Dailyinout.objects.create(                        
                                              money=money,
                                              inoutdate=inoutdate,
                                              creatorcode=user,
                                              createtime=createtime,
                                              validind=validind,
                                              remark=remark)
                    obj.codecodes.set([codecodes])
                    data = {"code": '1', "msg": "创建成功", }
                except Exception as err:      
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    print(data)
                    return HttpResponse(json.dumps(data))
    return None


def convert_date_format(date_str):
    """转换支付宝日期格式为 Django 可接受的格式"""
    try:
        # 尝试解析 "2026/2/26 2:29" 格式
        match = re.match(r'(\d{4})/(\d{1,2})/(\d{1,2})\s+(\d{1,2}):(\d{1,2})', date_str)
        if match:
            year, month, day, hour, minute = match.groups()
            # 补零
            month = month.zfill(2)
            day = day.zfill(2)
            hour = hour.zfill(2)
            minute = minute.zfill(2)
            return f"{year}-{month}-{day} {hour}:{minute}:00"

        # 尝试解析其他格式
        return date_str
    except:
        return date_str