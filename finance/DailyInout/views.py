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
    if (validind == '*'):
        validind = ['0', '1']
    elif (validind == '0'):
        validind = ['0']
    elif (validind == '1'):
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

@csrf_exempt
def blukCreate(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        datas = json.loads(request.POST.get("data"))

        keys = ("inoutdate", "counterparty", "tradeName", "accountingSerialNmbe", "businesSserialNumbe", "merchantOrderNumbe", "transactionNo",
               "money", "transactionChannel",  "businessType", "remark", "consumer",  "codecodes", "creatorcode", "createtime",  "validind")
        kwargsDict = [dict(zip(keys,value)) for value in datas]
        try:
            for kwarg in kwargsDict:
                kwarg["creatorcode"] = User.objects.get(pk=kwarg["creatorcode"])
                codecode = kwarg["codecodes"]
                del kwarg["codecodes"]
                dailuinoutObj = Dailyinout.objects.create(**kwarg)   
                try:
                    codecodes = Code.objects.get(codecode=codecode)
                except Exception as err:
                    data = {"code": '0', "msg": "{} 不存在, {}".format(codecodes, err), }
                    return HttpResponse(json.dumps(data))         
                dailuinoutObj.codecodes.set([codecodes])
                data = {"code": '1', "msg": "创建成功", }
        except Exception as err:      
            data = {"code": '0', "msg": "{}".format(err), }
        finally:
            return HttpResponse(json.dumps(data))

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

@csrf_exempt
def DailyinoutChange(request):
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
