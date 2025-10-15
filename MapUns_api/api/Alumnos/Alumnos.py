from django.shortcuts import render

from django.http import HttpResponse
from django.http.response import JsonResponse

from django.core.exceptions import ValidationError

from django.db.models.functions import Concat

from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from django.db.models import Sum, Subquery, OuterRef, Exists, Q, DecimalField
from django.db.models.functions import Coalesce

import json, math

from utilities import list_utils, list_reports

from .models import Alumnos
from Locaciones.models import Provincias, Localidades
from .models import Alumnos
from django.db.models import Exists, OuterRef
from django.contrib.postgres.aggregates import ArrayAgg

from django.utils.dateparse import parse_date
from django.db.models import Q

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def MapList(request):
    center = None

    provincia_id = request.GET.get('provincia_id')
    localidad_id = request.GET.get('localidad_id')
    carreras_param = request.GET.get('carrera')
    regularidad = request.GET.get('regularidad', 'todos').lower()
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Alumnos.objects.all()

    if localidad_id:
        qs = qs.filter(localidad_id=localidad_id)
        try:
            localidad = Localidades.objects.get(pk=localidad_id)
            center = {"lat": localidad.latitud, "lng": localidad.longitud}
        except Localidades.DoesNotExist:
            pass
    elif provincia_id:
        qs = qs.filter(localidad__provincia_id=provincia_id)

    if carreras_param and carreras_param.lower() != 'todos':
        carreras = [c.strip() for c in carreras_param.split(',') if c.strip()]
        if carreras:
            q_filter = Q()
            for c in carreras:
                q_filter |= Q(carrera__icontains=c)
            qs = qs.filter(q_filter)

    if regularidad in ('regulares', 'regular', 'si', 'true', '1'):
        qs = qs.filter(esRegular=True)
    elif regularidad in ('noregulares', 'no_regulares', 'no', 'false', '0'):
        qs = qs.filter(esRegular=False)

    d_from = parse_date(fecha_desde) if fecha_desde and fecha_desde != 'todos' else None
    d_to   = parse_date(fecha_hasta) if fecha_hasta and fecha_hasta != 'todos' else None

    if d_from:
        qs = qs.filter(fecha_inscripcion__gte=d_from)
    if d_to:
        qs = qs.filter(fecha_inscripcion__lte=d_to)

    rows = list(
        qs.order_by('nombre').values(
            'pk',
            'nombre',
            'latitud',
            'longitud',
            'domicilio',
            'localidad_id',
            'carrera',
            'esRegular',
            'fecha_inscripcion',
        )
    )

    return JsonResponse({"rows": rows, "center": center})


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Alumnos.objects.all().order_by('nombre')
    return list_utils.obj_tables_default(db_query, obj_data)

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    db_query = Alumnos.objects.filter(debaja=False).order_by('nombre')
    ar_reply = list_utils.obj_filtered_list(db_query,1,1,['pk','nombre'],[],[],False)['list']
    return JsonResponse({"rows":ar_reply})

@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Create(request):
    obj_data = json.loads(request.body)
    dict_errors = dict()
    try:
        new_obj = Alumnos(**obj_data)
        new_obj.full_clean()
        new_obj.save()
        return JsonResponse({"success":True,"pk":new_obj.pk})
    except ValidationError as e:
        for v in e:
            dict_errors[v[0]] = v[1][0]
        return JsonResponse({"success":False,"errors":dict_errors})


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Edit(request, id):
    obj = Alumnos.objects.get(pk=id)
    if request.method == "POST":
        obj_data = json.loads(request.body)
        dict_errors = dict()
        try:
            for attr, value in obj_data.items(): 
                setattr(obj, attr, value)
            obj.full_clean()
            obj.save()
            return JsonResponse({"success":True})
        except ValidationError as e:
            for v in e:
                dict_errors[v[0]] = v[1][0]
            return JsonResponse({"success":False,"errors":dict_errors})
    else:
        obj = Alumnos.objects.get(pk=id)
        return JsonResponse(obj.json(),safe=False)

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Detail(request, id):
    obj = Alumnos.objects.get(pk=id)
    return JsonResponse(obj.json(),safe=False)

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Delete(request, id):
    obj = Alumnos.objects.get(pk=id)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success":True})
        except:
            try:
                obj.debaja = True
                obj.save()
                return JsonResponse({"success":True})
            except:
                return JsonResponse({"success":False})
    else:
        return JsonResponse(obj.json(),safe=False)


def Export(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Alumnos.objects.filter()
    return list_reports.file_default_export(db_query,'Alumnos',obj_data)
