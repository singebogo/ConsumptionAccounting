'''
Author: singebogo
Date: 2022-09-23 15:19:15
LastEditors: singebogo
LastEditTime: 2022-09-23 17:58:41
Description: 
'''
from datetime import datetime, timedelta
import json
from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize

from django.db.models import Count, Max, Sum
from django.db.models.functions import TruncMonth,TruncYear,ExtractYear,ExtractMonth
from django.db import connection

from DailyInout.models import Dailyinout
from Infrastructure.models import Code, Codetype

@csrf_exempt
def everyDay(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        day = request.POST.get('day')
        if(not day):
            day = datetime.now().strftime("%Y-%m-%d")            
        else:
            day = datetime.strptime(day, "%Y-%m-%d")

        yesterday = day+ timedelta(days=-1)
        
        codetypes = Codetype.objects.filter(validind__in=['1']).values_list('codetype', flat=True).distinct()
        data = {}
        for codetype in codetypes:
            codecodes = Code.objects.filter(validind__in=['1']).filter(codetype=codetype).values_list('codecode', flat=True).distinct()
            Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes__in=codecodes)
                                        
            todayTotal =  Dailyinoutobj.filter(inoutdate = day).aggregate(today=Sum('money'))
            yesterdayTotal = Dailyinoutobj.filter(inoutdate = yesterday).aggregate(yesterday=Sum('money'))

            data[codetype] = [json.dumps(todayTotal, cls=DjangoJSONEncoder) , json.dumps(yesterdayTotal, cls=DjangoJSONEncoder) ]
            
        return HttpResponse(json.dumps(data))

@csrf_exempt
def curMonth(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        year = request.POST.get('curYear')
        month = request.POST.get('curMonth')
        codetypes = Codetype.objects.filter(validind__in=['1']).values_list('codetype', flat=True).distinct()
        data = {}
        for codetype in codetypes:
            codecodes = Code.objects.filter(validind__in=['1']).filter(codetype=codetype).values_list('codecode', flat=True).distinct()
            Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes__in=codecodes)
            monthTotal =  Dailyinoutobj.filter(inoutdate__year=year, inoutdate__month=month).aggregate(month=Sum('money'))
            data[codetype] = json.dumps(monthTotal, cls=DjangoJSONEncoder)

        return HttpResponse(json.dumps(data))

@csrf_exempt
def curYear(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        year = request.POST.get('curYear')
        codetypes = Codetype.objects.filter(validind__in=['1']).values_list('codetype', flat=True).distinct()
        data = {}
        for codetype in codetypes:
            codecodes = Code.objects.filter(validind__in=['1']).filter(codetype=codetype).values_list('codecode', flat=True).distinct()
            Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes__in=codecodes)
            monthTotal =  Dailyinoutobj.filter(inoutdate__year=year).aggregate(year=Sum('money'))
            data[codetype] = json.dumps(monthTotal, cls=DjangoJSONEncoder)

        return HttpResponse(json.dumps(data))


@csrf_exempt
def sevenDay(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        day = request.POST.get('day')
        if(not day):
            day = datetime.now().strftime("%Y-%m-%d")            
        else:
            day = datetime.strptime(day, "%Y-%m-%d")

        sevenday = day+ timedelta(days=-7)
        
        codetypes = Codetype.objects.filter(validind__in=['1']).values_list('codetype', flat=True).distinct()
        data = {}
        for codetype in codetypes:
            codecodes = Code.objects.filter(validind__in=['1']).filter(codetype=codetype).values_list('codecode', flat=True).distinct()
            Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes__in=codecodes)\
                                        .filter(inoutdate__lte = day).filter(inoutdate__gte = sevenday)          

            # 获取七天数据
            select = {'day': connection.ops.datetime_trunc_sql('day', 'inoutdate', 8)}
            severndayobj = Dailyinoutobj.extra(select=select).values('codecodes__codetype', 'codecodes', 'day')\
                                                .annotate(money=Sum('money')).order_by("day")[0:9]
            data[codetype] = json.dumps(list(severndayobj), cls=DjangoJSONEncoder)
        
        return HttpResponse(json.dumps(data))
