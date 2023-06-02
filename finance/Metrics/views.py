from django.http.response import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder, Serializer
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db.models import Min, Max

from Infrastructure.models import Code, Codetype
from Infrastructure.views import status

from .models import DetectionMetrics, limitType

import json


def invalidLimittype(validind):
    if (validind == '*'):
        validind = [limitType.DAY, limitType.MONTH, limitType.YEAR]
    elif (validind == '0'):
        validind = [limitType.DAY]
    elif (validind == '1'):
        validind = [limitType.MONTH]
    elif (validind == '2'):
        validind = [limitType.YEAR]
    else:
        validind = [limitType.DAY, limitType.MONTH, limitType.YEAR]
    return validind


@csrf_exempt
def MetricsAll(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetypeQuery")
        validind = request.POST.get("validindQuery")
        codecode = request.POST.get("codecodeQuery")
        limit = request.POST.get("limitQuery")
        style = request.POST.get("styleQuery")
        limittype = request.POST.get("limittypeQuery")
        sumlimittype = request.POST.get("sumlimittypeQuery")

        # 状态处理
        validind = status(validind)
        sumlimittype = status(sumlimittype)
        limittype = invalidLimittype(limittype)

        DetectionMetricsobj = DetectionMetrics.objects.filter(validind__in=validind).filter(
            limittype__in=limittype).filter(sumlimittype__in=sumlimittype)

        if (codecode):
            DetectionMetricsobj = DetectionMetricsobj.filter(codecodes=codecode)
        elif (codetype):
            DetectionMetricsobj = DetectionMetricsobj.filter(
                codecodes__codetype=codetype)
        elif (limit):
            DetectionMetricsobj = DetectionMetricsobj.filter(limit=limit)
        elif (style):
            DetectionMetricsobj = DetectionMetricsobj.filter(
                style__contains=style)

        # 获取外键数据
        DetectionMetricsobj = DetectionMetricsobj.values('id', 'codecodes__codetype', 'codecodes', 'limittype',
                                                         'sumlimittype',  'limit', 'style', 'creatorcode', 'createtime',
                                                         'updatetime', 'validind', 'remark',)
        serialized_q = json.dumps(
            list(DetectionMetricsobj), cls=DjangoJSONEncoder)
        return HttpResponse(serialized_q)


@csrf_exempt
def MetricsDelete(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("pk")
        if (not id):
            return HttpResponse(json.dumps({"code": '0', "msg": "主键不能为空", }))
        else:
            obj = DetectionMetrics.objects.filter(id=id).delete()
            return HttpResponse(json.dumps({"code": '1', "msg": "{} 删除成功".format(id), }))


@csrf_exempt
def MetricsChange(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("id")
        codecodes = request.POST.get("codecodes")
        limit = request.POST.get("limit")
        style = request.POST.get("style")
        creatorcode = request.POST.get("creatorcode")
        createtime = request.POST.get("createtime")
        updatetime = request.POST.get("updatetime")
        validind = request.POST.get("validind")
        remark = request.POST.get("remark")
        sumlimittype = request.POST.get("sumlimittype")
        limittype = request.POST.get("limittype")

        if (not codecodes or not validind or not limit or not style):
            msg = "codecodes: {} or validind: {} or limit:{} or style:{} is null".format(
                codecodes, validind, limit, style)
            return HttpResponse({"code": '0', "msg": msg})
        else:
            user = User.objects.filter(pk=creatorcode).first()
            try:
                codecodes = Code.objects.get(codecode=codecodes)
            except Exception as err:
                data = {"code": '0', "msg": "{} 不存在, {}".format(
                    codecodes, err), }
                return HttpResponse(json.dumps(data))
            num = 0
            if (id):
                num = DetectionMetrics.objects.filter(id=id).count()
            if (num != 0):
                try:
                    obj = DetectionMetrics.objects.get(id=id)
                    obj.limit = limit
                    obj.style = style
                    obj.creatorcode = user
                    obj.updatetime = updatetime
                    obj.validind = validind
                    obj.remark = remark
                    obj.sumlimittype = sumlimittype
                    obj.limittype = limittype
                    obj.save()
                    obj.codecodes.set([codecodes])
                    data = {"code": '1', "msg": "更新成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))
            else:
                try:
                    obj = DetectionMetrics.objects.create(
                        limit=limit,
                        style=style,
                        creatorcode=user,
                        createtime=createtime,
                        validind=validind,
                        sumlimittype=sumlimittype,
                        limittype=limittype,
                        remark=remark)
                    obj.codecodes.set([codecodes])
                    data = {"code": '1', "msg": "创建成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))


@csrf_exempt
def limitTypeMetrics(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        limittype = request.POST.get("limittype")

        data = {}
        codecodes = Code.objects.all().values_list('codecode', flat=True)
        for code in codecodes:
            DetectionMetricsobj = DetectionMetrics.objects.filter(
                codecodes=code).filter(validind__in=['1']).filter(limittype=limittype)
            sumlimittype = DetectionMetricsobj.values_list(
                'sumlimittype', flat=True).distinct()
            ele = {}
            for type in sumlimittype:
                aggregateobj = DetectionMetricsobj.filter(
                    sumlimittype=type).aggregate(min=Min('limit'), max=Max('limit'))
                metricsobj = DetectionMetrics.objects.filter(validind__in=['1']).filter(sumlimittype=type).filter(
                    limittype=limittype).filter(limit__in=[aggregateobj['max'], aggregateobj['min']])\
                    .values('id', 'codecodes__codetype', 'codecodes', 'sumlimittype', 'limittype', 'limit', 'style',
                            'creatorcode', 'createtime', 'updatetime', 'validind', 'remark',)
                ele[type] = json.dumps(list(metricsobj), cls=DjangoJSONEncoder)
            data[code] = json.dumps(ele, cls=DjangoJSONEncoder)

        return HttpResponse(json.dumps(data))
