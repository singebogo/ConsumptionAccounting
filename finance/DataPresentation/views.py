'''
Author: singebogo
Date: 2022-09-21 09:42:39
LastEditors: singebogo
LastEditTime: 2022-09-23 15:25:02
Description: 
'''
from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder, Serializer

from django.db.models import Count, Max, Sum
from django.db.models.functions import TruncMonth,TruncYear,ExtractYear,ExtractMonth, TruncDay
from django.db import connection

# Create your views here.

from Infrastructure.models import Code, Codetype
from DailyInout.models import Dailyinout
import json
from django.db.models import Q

@csrf_exempt
def DataPresentation(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        year = request.POST.get("year")
        month = request.POST.get("month")
        type =  request.POST.get("type")
        pervyear = request.POST.get('pervyear')

        data = {}                   

        if('5' == type):
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                select = {'year': connection.ops.datetime_trunc_sql('year', 'inoutdate', 8)}
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1'])\
                    .filter(codecodes__codetype = codetype)\
                    .extra(select=select) \
                    .filter(inoutdate__year__range=(pervyear, year)) \
                    .values('money', 'year')\
                    .annotate(yearMoney=Sum('money')).order_by("year").values()
                yearSum = {}
                for inout in Dailyinoutobj:
                    everyear = inout["year"].year
                    if everyear in yearSum:
                        yearSum[everyear] = yearSum[everyear] + inout["yearMoney"]
                    else:
                        yearSum[everyear] = inout["yearMoney"]
                print(yearSum)
                data[codetype] = json.dumps(yearSum, cls=DjangoJSONEncoder) 
        elif('4' == type):
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                select = {'month': connection.ops.datetime_trunc_sql('month', 'inoutdate', 8)}
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes__codetype = codetype).filter(inoutdate__year=year)\
                                                        .extra(select=select).values('money', 'month')\
                                                        .annotate(monthMoney=Sum('money')).order_by("month").values()
                daySum = {}
                for inout in Dailyinoutobj:
                    month = str(inout["month"])[:7]
                    if month in daySum:
                        daySum[month] = daySum[month] + inout["monthMoney"]
                    else:
                        daySum[month] = inout["monthMoney"]
                 
                data[codetype] = json.dumps(daySum, cls=DjangoJSONEncoder) 
        elif('3' == type):
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                select = {'day': connection.ops.datetime_trunc_sql('day', 'inoutdate', 8)}
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                                                  .filter(codecodes__codetype = codetype) \
                                                  .filter(inoutdate__year=year, inoutdate__month=month) \
                                                  .extra(select=select).order_by("day").values()
                daySum = {}
                for inout in Dailyinoutobj:
                    inoutdate = str(inout["inoutdate"])[:10]
                    if inoutdate in daySum:
                        daySum[inoutdate] = daySum[inoutdate] + inout["money"]
                    else:
                        daySum[inoutdate] = inout["money"]
                 
                data[codetype] = json.dumps(daySum, cls=DjangoJSONEncoder) 
        else:
            codecodes = Code.objects.all().values_list('codecode', flat=True)
            for code in codecodes:
                if('0' == type):
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes = code).filter(inoutdate__year=year, inoutdate__month=month)
                    Dailyinoutobj = Dailyinoutobj.values('id',
                            'codecodes__codetype', 'codecodes', 'money', 'inoutdate',
                            'creatorcode', 'createtime', 'updatetime', 'validind', 'remark',)
                elif('1' == type):
                    # 获取近一年数据
                    select = {'month': connection.ops.datetime_trunc_sql('month', 'inoutdate', 8)}
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes = code).filter(inoutdate__year=year)\
                                                        .extra(select=select).values('codecodes__codetype', 'codecodes', 'month')\
                                                        .annotate(money=Sum('money')).order_by("month")[0:9]
                elif('2' == type):
                    # 获取近一轮年数据
                    select = {'year': connection.ops.datetime_trunc_sql('year', 'inoutdate', 8)} 
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']).filter(codecodes = code).filter(inoutdate__year__gte=pervyear)\
                                                        .filter(inoutdate__year__lte = year)\
                                                        .extra(select=select).values('codecodes__codetype', 'codecodes', 'year')\
                                                        .annotate(money=Sum('money')).order_by("year")[0:4]  
                data[code] = json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)  
            
        return HttpResponse(json.dumps(data))

@csrf_exempt
def DataPrsentQueryPrimary(request):        
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("id")
        if(id.find(',') != -1):
            ids = [ int(i) for i in id.split(',')]
        else:
            ids = [int(id)]
        try:
            Dailyinoutobj = Dailyinout.objects.filter(id__in=ids)
            Dailyinoutobj = Dailyinoutobj.values('id', 'money', 'inoutdate', 'remark')
            data =json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)         
        except Exception as err:
            data = json.dumps("{}".format(err))
        finally:
            return HttpResponse(data)