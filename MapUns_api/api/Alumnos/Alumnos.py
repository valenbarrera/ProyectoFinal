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
from Datos_domicilio.models import Datos_domicilio
from django.db.models import F, Value
from django.db.models.functions import Concat
from Locaciones.models import Localidades
from Datos_domicilio.models import Datos_domicilio
from django.contrib.postgres.aggregates import ArrayAgg

from django.utils.dateparse import parse_date
from rest_framework.parsers import MultiPartParser, FormParser
from .services.importer import import_alumnos

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def MapList(request):
    """
    Devuelve puntos del mapa cruzando Alumnos con Datos_domicilio.
    Usa coordenadas de procedencia o estudio según `ubicacion`.
    Aplica filtros por provincia/localidad sobre la localidad correspondiente,
    y por carrera, regularidad y fechas sobre Alumnos.
    """
    center = None

    provincia_id = request.GET.get('provincia_id')
    localidad_id = request.GET.get('localidad_id')
    carreras_param = request.GET.get('carrera')
    regularidad = request.GET.get('regularidad', 'todos').lower()
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    ubicacion = (request.GET.get('ubicacion') or 'procedencia').lower()

    # Mapeo de campos por tipo de ubicación
    if ubicacion == 'estudio':
        lat_field = 'lat_estudio'
        lon_field = 'long_estudio'
        loc_field = 'localidad_estudio'
        calle_field = 'calle_estudio'
        nro_field = 'nro_estudio'
    else:
        lat_field = 'lat_procedencia'
        lon_field = 'long_procedencia'
        loc_field = 'localidad_procedencia'
        calle_field = 'calle_procedencia'
        nro_field = 'nro_procedencia'

    qs = Datos_domicilio.objects.select_related('alumno')

    # Filtros geográficos
    if localidad_id:
        qs = qs.filter(**{f'{loc_field}_id': localidad_id})
        try:
            loc = Localidades.objects.get(pk=localidad_id)
            center = {"lat": loc.latitud, "lng": loc.longitud}
        except Localidades.DoesNotExist:
            pass
    elif provincia_id:
        qs = qs.filter(**{f'{loc_field}__provincia_id': provincia_id})

    # Filtros de alumno
    if carreras_param and carreras_param.lower() != 'todos':
        carreras = [c.strip() for c in carreras_param.split(',') if c.strip()]
        if carreras:
            qf = Q()
            for c in carreras:
                qf |= Q(alumno__carrera__icontains=c)
            qs = qs.filter(qf)

    if regularidad in ('regulares', 'regular', 'si', 'true', '1'):
        qs = qs.filter(alumno__esRegular=True)
    elif regularidad in ('noregulares', 'no_regulares', 'no', 'false', '0'):
        qs = qs.filter(alumno__esRegular=False)

    d_from = parse_date(fecha_desde) if fecha_desde and fecha_desde != 'todos' else None
    d_to   = parse_date(fecha_hasta) if fecha_hasta and fecha_hasta != 'todos' else None
    if d_from:
        qs = qs.filter(alumno__fecha_inscripcion__gte=d_from)
    if d_to:
        qs = qs.filter(alumno__fecha_inscripcion__lte=d_to)

    # Construir filas
    rows = []
    for d in qs:
        lat = getattr(d, lat_field, 0) or 0
        lon = getattr(d, lon_field, 0) or 0
        try:
            latf = float(lat)
            lonf = float(lon)
        except Exception:
            continue
        if latf == 0 and lonf == 0:
            continue
        domicilio_txt = (f"{getattr(d, calle_field, '')} {getattr(d, nro_field, '')}").strip()
        rows.append({
            'pk': d.alumno.pk,
            'nombre': d.alumno.nombre,
            'apellido': d.alumno.apellido,
            'latitud': latf,
            'longitud': lonf,
            'domicilio': domicilio_txt,
            'localidad_id': getattr(d, f'{loc_field}_id'),
            'carrera': d.alumno.carrera,
            'esRegular': d.alumno.esRegular,
            'fecha_inscripcion': d.alumno.fecha_inscripcion,
        })

    return JsonResponse({"rows": rows, "center": center})


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    # Listado basado en Datos_domicilio (procedencia) + alumno y localidad
    db_query = (
        Datos_domicilio.objects.select_related('alumno', 'localidad_procedencia__provincia')
        .annotate(
            pk=F('alumno__pk'),
            nombre=F('alumno__nombre'),
            apellido=F('alumno__apellido'),
            domicilio=Concat(F('calle_procedencia'), Value(' '), F('nro_procedencia')),
            localidad_nombre=F('localidad_procedencia__nombre'),
            provincia_nombre=F('localidad_procedencia__provincia__nombre'),
        )
        .order_by('alumno__apellido', 'alumno__nombre')
    )
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
    # Detalle completo del alumno con tablas relacionadas
    from Datos_domicilio.models import Datos_domicilio
    from Datos_familiares.models import Datos_familiares
    from Datos_ocupacionales.models import Datos_ocupacionales

    a = Alumnos.objects.get(pk=id)
    dom = Datos_domicilio.objects.filter(alumno=a).select_related(
        'localidad_procedencia__provincia', 'localidad_estudio__provincia'
    ).first()
    fam = Datos_familiares.objects.filter(alumno=a).first()
    ocu = Datos_ocupacionales.objects.filter(alumno=a).first()

    def loc_tuple(loc):
        if not loc:
            return None, None
        return (loc.nombre, getattr(loc.provincia, 'nombre', None))

    lp_nombre, pp_nombre = loc_tuple(dom.localidad_procedencia) if dom else (None, None)
    le_nombre, pe_nombre = loc_tuple(dom.localidad_estudio) if dom else (None, None)

    data = {
        'pk': a.pk,
        'nombre': a.nombre,
        'apellido': a.apellido,
        'genero': a.genero,
        'pais_documento': a.pais_documento,
        'tipo_documento': a.tipo_documento,
        'nro_documento': a.nro_documento,
        'nacionalidad': a.nacionalidad,
        'cuil': a.cuil,
        'pueblos_originarios': a.pueblos_originarios,
        'obra_social': a.obra_social,
        'telefono': a.telefono,
        'email': a.email,
        'esRegular': a.esRegular,
        'carrera': a.carrera,
        'fecha_inscripcion': a.fecha_inscripcion,
    }
    if dom:
        data.update({
            'calle_procedencia': dom.calle_procedencia,
            'nro_procedencia': dom.nro_procedencia,
            'calle_estudio': dom.calle_estudio,
            'nro_estudio': dom.nro_estudio,
            'localidad_procedencia': lp_nombre,
            'provincia_procedencia': pp_nombre,
            'localidad_estudio': le_nombre,
            'provincia_estudio': pe_nombre,
        })
    if fam:
        data.update({
            'estado_civil': fam.estado_civil,
            'cant_hijos': fam.cant_hijos,
            'nombre_padre': fam.nombre_padre,
            'apellido_padre': fam.apellido_padre,
            'vive_padre': fam.vive_padre,
            'nivel_estudio_padre': fam.nivel_estudio_padre,
            'nombre_madre': fam.nombre_madre,
            'apellido_madre': fam.apellido_madre,
            'vive_madre': fam.vive_madre,
            'nivel_estudio_madre': fam.nivel_estudio_madre,
        })
    if ocu:
        data.update({
            'colegio_secundario': ocu.colegio_secundario,
            'anio_egreso_secundario': ocu.anio_egreso_secundario,
            'condicion_laboral': ocu.condicion_laboral,
        })

    return JsonResponse(data, safe=False)

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
