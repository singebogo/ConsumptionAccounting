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
from django.utils import timezone
from django.db.models import Count, Max, Sum
from django.db.models.functions import TruncMonth,TruncYear,ExtractYear,ExtractMonth, TruncDay
from django.db import connection
from django.db.models.functions import TruncDay, TruncMonth, TruncYear


from Infrastructure.models import Code, Codetype
from DailyInout.models import Dailyinout
import json


@csrf_exempt
def DataPresentation(request):
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        year = request.POST.get("year")
        month = request.POST.get("month")
        type = request.POST.get("type")
        pervyear = request.POST.get('pervyear')

        data = {}

        if ('5' == type):
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                # 使用 TruncYear 替代 datetime_trunc_sql
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                    .filter(codecodes__codetype=codetype) \
                    .filter(inoutdate__year__range=(pervyear, year)) \
                    .annotate(year=TruncYear('inoutdate')) \
                    .values('year') \
                    .annotate(yearMoney=Sum('money')) \
                    .order_by("year") \
                    .values('year', 'yearMoney')

                yearSum = {}
                for inout in Dailyinoutobj:
                    # 确保 year 是 datetime 对象
                    if inout["year"]:
                        everyear = inout["year"].year
                        yearSum[everyear] = inout["yearMoney"]

                print(yearSum)
                data[codetype] = json.dumps(yearSum, cls=DjangoJSONEncoder)

        elif ('4' == type):
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                # 使用 TruncMonth 替代 datetime_trunc_sql
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                    .filter(codecodes__codetype=codetype) \
                    .filter(inoutdate__year=year) \
                    .annotate(month=TruncMonth('inoutdate')) \
                    .values('month') \
                    .annotate(monthMoney=Sum('money')) \
                    .order_by("month") \
                    .values('month', 'monthMoney')

                monthSum = {}
                for inout in Dailyinoutobj:
                    if inout["month"]:
                        month = inout["month"].strftime("%Y-%m")
                        monthSum[month] = inout["monthMoney"]

                data[codetype] = json.dumps(monthSum, cls=DjangoJSONEncoder)

        elif '3' == type:
            codetypes = Codetype.objects.all().values_list('codetype', flat=True)
            for codetype in codetypes:
                # 使用 TruncDay 替代 datetime_trunc_sql
                Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                    .filter(codecodes__codetype=codetype) \
                    .filter(inoutdate__year=year, inoutdate__month=month) \
                    .annotate(day=TruncDay('inoutdate')) \
                    .values('day') \
                    .annotate(dayMoney=Sum('money')) \
                    .order_by("day") \
                    .values('day', 'dayMoney')

                daySum = {}
                for inout in Dailyinoutobj:
                    if inout["day"]:
                        inoutdate = inout["day"].strftime("%Y-%m-%d")
                        daySum[inoutdate] = inout["dayMoney"]

                data[codetype] = json.dumps(daySum, cls=DjangoJSONEncoder)

        else:
            codecodes = Code.objects.all().values_list('codecode', flat=True)
            for code in codecodes:
                if ('0' == type):
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                        .filter(codecodes=code) \
                        .filter(inoutdate__year=year, inoutdate__month=month) \
                        .values('id', 'codecodes__codetype', 'codecodes', 'money',
                                'inoutdate', 'creatorcode', 'createtime', 'updatetime',
                                'validind', 'remark')
                    data[code] = json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)

                elif ('1' == type):
                    # 获取近一年数据
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                        .filter(codecodes=code) \
                        .filter(inoutdate__year=year) \
                        .annotate(month=TruncMonth('inoutdate')) \
                        .values('codecodes__codetype', 'codecodes', 'month') \
                        .annotate(money=Sum('money')) \
                        .order_by("month")[:9]
                    data[code] = json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)

                elif ('2' == type):
                    # 获取近一轮年数据
                    Dailyinoutobj = Dailyinout.objects.filter(validind__in=['1']) \
                        .filter(codecodes=code) \
                        .filter(inoutdate__year__gte=pervyear) \
                        .filter(inoutdate__year__lte=year) \
                        .annotate(year=TruncYear('inoutdate')) \
                        .values('codecodes__codetype', 'codecodes', 'year') \
                        .annotate(money=Sum('money')) \
                        .order_by("year")[:4]
                    data[code] = json.dumps(list(Dailyinoutobj), cls=DjangoJSONEncoder)

        return HttpResponse(json.dumps(data))
    return None


@csrf_exempt
def DataPrsentQueryPrimary(request):        
    global data
    if request.method == "GET":
        return HttpResponse("不支持Get请求")
    elif request.method == "POST":
        id = request.POST.get("id")
        if id.find(',') != -1:
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
    return None