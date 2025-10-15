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
from rest_framework.parsers import MultiPartParser, FormParser
import csv
import io
from datetime import datetime

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

    name = upload.name.lower()
    created = 0
    errors = []

    def get_bool(val):
        if val is None:
            return False
        s = str(val).strip().lower()
        return s in ('1', 'true', 't', 'si', 'sí', 'y', 'yes', 's')

    def parse_date_safe(val):
        if not val:
            return None
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
            try:
                return datetime.strptime(str(val).strip(), fmt).date()
            except Exception:
                pass
        return None

    def resolve_localidad(row):
        loc_id = row.get('localidad_id') or row.get('localidadid')
        if loc_id:
            try:
                return Localidades.objects.get(pk=int(loc_id))
            except Exception:
                return None
        nombre = row.get('localidad') or row.get('ciudad')
        if not nombre:
            return None
        prov = row.get('provincia')
        qs = Localidades.objects.filter(nombre__iexact=nombre.strip())
        if prov:
            qs = qs.filter(provincia__nombre__iexact=prov.strip())
        return qs.first()

    def upsert_row(row, idx):
        nonlocal created
        try:
            nombre = (row.get('nombre') or '').strip()
            if not nombre:
                raise ValueError('Falta nombre')

            lat = row.get('latitud'); lng = row.get('longitud')
            if lat in (None, '') or lng in (None, ''):
                raise ValueError('Falta latitud/longitud')

            try:
                lat = float(str(lat).replace(',', '.'))
                lng = float(str(lng).replace(',', '.'))
            except Exception:
                raise ValueError('Lat/Lon inválidos')

            localidad = resolve_localidad(row)
            if not localidad:
                raise ValueError('Localidad no encontrada')

            codigo = (row.get('codigo') or '').strip()
            if not codigo:
                codigo = (row.get('dni') or '').strip()[:8] or (datetime.utcnow().strftime('%y%m%d%H'))

            alumno = Alumnos(
                nombre=nombre,
                email=(row.get('email') or '').strip() or None,
                telefono=(row.get('telefono') or '').strip() or None,
                domicilio=(row.get('domicilio') or '').strip() or None,
                localidad=localidad,
                latitud=lat,
                longitud=lng,
                dni=(row.get('dni') or '').strip() or None,
                codigo=codigo,
                esRegular=get_bool(row.get('esregular')),
                carrera=(row.get('carrera') or '').strip() or None,
                fecha_inscripcion=parse_date_safe(row.get('fecha_inscripcion')) or datetime.utcnow().date(),
            )
            alumno.full_clean()
            alumno.save()
            created += 1
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})

    if name.endswith('.csv'):
        data = upload.read()
        # Try decode with utf-8-sig first to strip BOM
        try:
            text = data.decode('utf-8-sig')
        except Exception:
            text = data.decode('latin-1')
        reader = csv.DictReader(io.StringIO(text))
        for idx, row in enumerate(reader, start=2):  # header is line 1
            row_norm = { (k or '').strip().lower(): (v if v is not None else '') for k, v in row.items() }
            upsert_row(row_norm, idx)
    elif name.endswith('.xlsx'):
        try:
            import openpyxl  # type: ignore
        except Exception:
            return JsonResponse({"success": False, "error": "Para XLSX instale 'openpyxl' o suba un CSV."}, status=400)
        wb = openpyxl.load_workbook(upload, read_only=True)
        ws = wb.active
        headers = []
        for i, row in enumerate(ws.iter_rows(values_only=True), start=1):
            if i == 1:
                headers = [str(c or '').strip().lower() for c in row]
            else:
                values = [c if c is not None else '' for c in row]
                row_norm = { headers[j]: values[j] if j < len(values) else '' for j in range(len(headers)) }
                upsert_row(row_norm, i)
    else:
        return JsonResponse({"success": False, "error": "Formato no soportado. Use .csv o .xlsx"}, status=400)

    return JsonResponse({"success": True, "created": created, "errors": errors})
