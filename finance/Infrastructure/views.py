from django.http.response import HttpResponse, JsonResponse
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
# Create your views here.
import json
from .models import Codetype, Code

# 状态处理


def status(validind):
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
def CodetypeAll(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codeTypeQuery")
        validind = request.POST.get("validindQuery")
        startdateQuery = request.POST.get("startdateQuery")
        enddateQuery = request.POST.get("enddateQuery")

        # 状态处理
        validind = status(validind)

        codetypeobj = Codetype.objects.filter(validind__in=validind)
        if (codetype):
            codetypeobj = codetypeobj.filter(codetype=codetype)
        if (startdateQuery):
            codetypeobj = Codetype.objects.filter(
                validind__in=validind).filter(createtime__gte=startdateQuery)                
        if (enddateQuery):
            codetypeobj = Codetype.objects.filter(
                validind__in=validind).filter(createtime__lte=enddateQuery)
        
        codetypeobj = codetypeobj.values()
        serialized_q = json.dumps(list(codetypeobj), cls=DjangoJSONEncoder)
        return HttpResponse(serialized_q)


@csrf_exempt
def CodetypeDelete(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("pk")
        if (not codetype):
            return HttpResponse(json.dumps({"code": '0', "msg": "codetype主键不能为空", }))
        else:
            obj = Codetype.objects.filter(codetype=codetype).delete()
            return HttpResponse(json.dumps({"code": '1', "msg": "{} 删除成功".format(codetype), }))


@csrf_exempt
def CodeTypeQueryPrimary(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetype")
        validind = request.POST.get("validind")

        validind = status(validind)

        if (len(codetype) == 0 or (len(validind) == 0)):
            return HttpResponse({"code": '0', "msg": "codetype: {} 或者validind: {} 不能为空".format(codetype, validind), })
        else:
            objs = Codetype.objects.filter(
                codetype=codetype).filter(validind=validind)
            return HttpResponse({"code": '1', "msg": serializers.serialize('json', objs), })


@csrf_exempt
def vaildCodeTypeQuery(request):
    if request.method == "GET":
        objs = Codetype.objects.filter(validind__in=['1'])
        return JsonResponse(serializers.serialize('json', objs))
    elif request.method == "POST":
        codetype = request.POST.get("selectCode")
        codename = request.POST.get('selectName')

        objs = Codetype.objects.filter(validind__in=['1'])
        if (codetype):
            objs = objs.filter(codetype=codetype)
        elif (codename):
            objs = objs.filter(codename__contains=codename)
        return HttpResponse(serializers.serialize('json', objs))


@csrf_exempt
def CodetypeChange(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetype")
        codename = request.POST.get("codename")
        creatorcode = request.POST.get("creatorcode")
        createtime = request.POST.get("createtime")
        updatetime = request.POST.get("updatetime")
        validdate = request.POST.get("validdate")
        invaliddate = request.POST.get("invaliddate")
        validind = request.POST.get("validind")
        remark = request.POST.get("remark")

        if (not codetype or not validind):
            msg = "codetype: {} or validind: {} is null".format(
                codetype, validind)
            return HttpResponse({"code": '0', "msg": msg})
        else:
            user = User.objects.filter(pk=creatorcode).first()
            num = Codetype.objects.filter(codetype=codetype).count()
            if (num != 0):
                try:
                    obj = Codetype.objects.get(codetype=codetype)
                    obj.codename = codename
                    obj.creatorcode = user
                    obj.updatetime = updatetime
                    obj.validdate = validdate
                    obj.invaliddate = invaliddate
                    obj.validind = validind
                    obj.remark = remark
                    obj.save()
                    data = {"code": '1', "msg": "更新成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))
            else:
                try:
                    obj = Codetype.objects.create(codetype=codetype,
                                                  codename=codename,
                                                  creatorcode=user,
                                                  createtime=createtime,
                                                  # updatetime=updatetime,
                                                  validdate=validdate,
                                                  invaliddate=invaliddate,
                                                  validind=validind,
                                                  remark=remark)
                    data = {"code": '1', "msg": "创建成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))


@csrf_exempt
def CodeTypeIsExist(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetype")
        if (len(codetype) == 0):
            return HttpResponse({"code": '0', "msg": "codetype主键不能为空", })
        else:
            num = Codetype.objects.filter(codetype=codetype).count()
            if (num != 0):
                return HttpResponse(json.dumps({"code": '1', "msg": "codetype: {} 主键已经存在".format(codetype), }))
            else:
                return HttpResponse(json.dumps({"code": '0', "msg": "codetype: {} 主键不存在".format(codetype), }))


@csrf_exempt
def CodeAll(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codetype = request.POST.get("codetypeQuery")
        codecode = request.POST.get("codecodeQuery")
        validind = request.POST.get("validindQuery")
        startdate = request.POST.get("startdateQuery")
        enddate = request.POST.get("enddateQuery")

        validind = status(validind)

        codeobj = Code.objects.filter(validind__in=validind)        
        if (codecode):
            codeobj = codeobj.filter(codecode=codecode)                
        if (codetype):
            codeobj = codeobj.filter(codetype=codetype)
        if (startdate):
            codeobj = codeobj.filter(createtime__gte=startdate)
        if (enddate):
            codeobj = codeobj.filter(createtime__lte=enddate)     
             
        codeobj = codeobj.values()
        serialized_q = json.dumps(list(codeobj), cls=DjangoJSONEncoder)
        return HttpResponse(serialized_q)


@csrf_exempt
def CodeDelete(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codecode = request.POST.get("pk")
        if (not codecode):
            return HttpResponse(json.dumps({"code": '0', "msg": "codetype主键不能为空", }))
        else:
            obj = Code.objects.filter(codecode=codecode).delete()
            return HttpResponse(json.dumps({"code": '1', "msg": "{} 删除成功".format(codecode), }))


@csrf_exempt
def CodeQueryPrimary(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codecode = request.POST.get("pk")
        validind = request.POST.get("validind")

        validind = status(validind)

        if (len(codecode) == 0 or (len(validind) == 0)):
            return HttpResponse({"code": '0', "msg": "codetype: {} 或者validind: {} 不能为空".format(codecode, validind), })
        else:
            objs = Code.objects.filter(
                codecode=codecode).filter(validind=validind)
            return HttpResponse({"code": '1', "msg": serializers.serialize('json', objs), })


@csrf_exempt
def CodeChange(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codecode = request.POST.get("codecode")
        codetype = request.POST.get("codetype_id")
        codename = request.POST.get("codename")
        creatorcode = request.POST.get("creatorcode")
        createtime = request.POST.get("createtime")
        updatetime = request.POST.get("updatetime")
        validdate = request.POST.get("validdate")
        invaliddate = request.POST.get("invaliddate")
        validind = request.POST.get("validind")
        remark = request.POST.get("remark")

        if (not codecode or not validind):
            msg = "codecode: {} or validind: {} is null".format(
                codecode, validind)
            return HttpResponse({"code": '0', "msg": msg})
        else:
            user = User.objects.filter(pk=creatorcode).first()
            try:
                codetype = Codetype.objects.get(codetype=codetype)
            except Exception as err:
                data = {"code": '0', "msg": "{} 不存在 {}".format(
                    codetype, err), }
                return HttpResponse(json.dumps(data))
            num = Code.objects.filter(codecode=codecode).count()
            if (num != 0):
                try:
                    obj = Code.objects.get(codecode=codecode)
                    obj.codetype = codetype
                    obj.codename = codename
                    obj.creatorcode = user
                    obj.updatetime = updatetime
                    obj.validdate = validdate
                    obj.invaliddate = invaliddate
                    obj.validind = validind
                    obj.remark = remark
                    obj.save()
                    data = {"code": '1', "msg": "更新成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))
            else:
                try:
                    obj = Code.objects.create(codecode=codecode,
                                              codetype=codetype,
                                              codename=codename,
                                              creatorcode=user,
                                              createtime=createtime,
                                              validdate=validdate,
                                              invaliddate=invaliddate,
                                              validind=validind,
                                              remark=remark)
                    data = {"code": '1', "msg": "创建成功", }
                except Exception as err:
                    data = {"code": '0', "msg": "{}".format(err), }
                finally:
                    return HttpResponse(json.dumps(data))


@csrf_exempt
def CodeIsExist(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        codecode = request.POST.get("codecode")
        if (len(codecode) == 0):
            return HttpResponse({"code": '0', "msg": "主键不能为空", })
        else:
            num = Code.objects.filter(codecode=codecode).count()
            if (num != 0):
                return HttpResponse(json.dumps({"code": '1', "msg": "code: {} 主键已经存在".format(codecode), }))
            else:
                return HttpResponse(json.dumps({"code": '0', "msg": "code: {} 主键不存在".format(codecode), }))


@csrf_exempt
def vaildCodeQuery(request):
    if request.method == "GET":
        objs = Code.objects.filter(validind__in=['1'])
    elif request.method == "POST":
        codecode = request.POST.get("selectCode")
        codename = request.POST.get('selectName')
        objs = Code.objects.filter(validind__in=['1'])
        if (codecode):
            objs = objs.filter(codecode=codecode)
        if (codename):
            objs = objs.filter(codename__contains=codename)
    return HttpResponse(serializers.serialize('json', objs))
