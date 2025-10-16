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
from django.contrib.postgres.aggregates import ArrayAgg

from django.utils.dateparse import parse_date
from rest_framework.parsers import MultiPartParser, FormParser
from .services.importer import import_alumnos

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def MapList(request):
    center = None

    carreras_param = request.GET.get('carrera')
    regularidad = request.GET.get('regularidad', 'todos').lower()
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Alumnos.objects.all()

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
            'apellido',
            'genero',
            'pais_documento',
            'tipo_documento',
            'nro_documento',
            'nacionalidad',
            'cuil',
            'pueblos_originarios',
            'obra_social',
            'telefono',
            'email',
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


@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
@parser_classes((MultiPartParser, FormParser))
def Import(request):
    """
    Importa alumnos desde un archivo CSV o XLSX.
    - Campo de formulario: 'file'
    - Soporta CSV UTF-8 con encabezados.
    - Para XLSX intenta usar openpyxl si está disponible.
    Encabezados esperados (case-insensitive):
      nombre, email, telefono, domicilio, localidad_id | (localidad, provincia),
      latitud, longitud, dni, carrera, esRegular, fecha_inscripcion(YYYY-MM-DD)
    'codigo' se genera automáticamente si no viene en el archivo.
    """
    upload = request.FILES.get('file')
    if not upload:
        return JsonResponse({"success": False, "error": "Falta el archivo ('file')."}, status=400)

    result = import_alumnos(upload)
    return JsonResponse({"success": True, **result})
