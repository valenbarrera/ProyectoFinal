from django.utils import timezone
import datetime

def AddMonth(fecha):
    mes = fecha.month
    ano = fecha.year
    if mes + 1 < 12:
        mes = mes + 1
    else:
        mes = 1
        ano = ano + 1
    return datetime.datetime(ano,mes,fecha.day)

def AddDay(fecha):
    return datetime.datetime(fecha.year,fecha.month,fecha.day) + datetime.timedelta(days=1)