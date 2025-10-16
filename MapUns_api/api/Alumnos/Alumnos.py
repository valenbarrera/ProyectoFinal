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
from datetime import datetime, date

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
    updated = 0
    errors = []

    def to_text(val):
        if val is None:
            return ''
        try:
            # Excel often sends floats for numeric-looking cells
            if isinstance(val, float):
                if val.is_integer():
                    val = int(val)
            return str(val).strip()
        except Exception:
            try:
                return unicode(val).strip()  # py2 safety if needed
            except Exception:
                return ''

    def get_bool(val):
        if val is None:
            return False
        s = str(val).strip().lower()
        return s in ('1', 'true', 't', 'si', 'sí', 'y', 'yes', 's')

    def parse_date_safe(val):
        if not val:
            return None
        if isinstance(val, (datetime, date)):
            return val.date() if isinstance(val, datetime) else val
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
            try:
                return datetime.strptime(str(val).strip(), fmt).date()
            except Exception:
                pass
        return None

    def resolve_localidad(row):
        loc_id = row.get('localidad_id') or row.get('localidadid') or row.get('localidad id') or row.get('id_localidad') or row.get('id localidad') or row.get('localidad_pk')
        if loc_id:
            try:
                if isinstance(loc_id, float):
                    loc_id = int(loc_id)
                return Localidades.objects.get(pk=int(loc_id))
            except Exception:
                return None
        nombre = row.get('localidad') or row.get('ciudad')
        if not nombre:
            return None
        prov = row.get('provincia')
        prov_id = row.get('provincia_id') or row.get('id_provincia') or row.get('provincia id')
        qs = Localidades.objects.filter(nombre__iexact=to_text(nombre))
        if prov_id:
            try:
                qs = qs.filter(provincia_id=int(prov_id))
            except Exception:
                pass
        elif prov:
            qs = qs.filter(provincia__nombre__iexact=to_text(prov))
        return qs.first()

    def upsert_row(row, idx):
        nonlocal created, updated
        try:
            nombre = to_text(row.get('nombre'))
            if not nombre:
                raise ValueError('Falta nombre')

            # normalizar aliases comunes
            if 'latitud' not in row and 'lat' in row:
                row['latitud'] = row.get('lat')
            if 'longitud' not in row and ('lng' in row or 'long' in row or 'longitude' in row):
                row['longitud'] = row.get('lng') or row.get('long') or row.get('longitude')

            lat = row.get('latitud'); lng = row.get('longitud')
            if lat in (None, '') or lng in (None, ''):
                raise ValueError('Falta latitud/longitud')

            try:
                if isinstance(lat, (int, float)):
                    lat = float(lat)
                else:
                    lat = float(str(lat).replace(',', '.'))
                if isinstance(lng, (int, float)):
                    lng = float(lng)
                else:
                    lng = float(str(lng).replace(',', '.'))
            except Exception:
                raise ValueError('Lat/Lon inválidos')

            localidad = resolve_localidad(row)
            if not localidad:
                raise ValueError('Localidad no encontrada')

            codigo_in = to_text(row.get('codigo'))
            dni_in = to_text(row.get('dni')) or None
            if not codigo_in:
                codigo_in = (dni_in[:8] if dni_in else '') or (datetime.utcnow().strftime('%y%m%d%H'))

            fi_raw = row.get('fecha_inscripcion') or row.get('fecha') or row.get('fecha inscripcion') or row.get('fecha_de_inscripcion')
            fi_parsed = parse_date_safe(fi_raw)

            # Upsert por DNI: si existe, actualiza; si no, crea
            alumno = None
            if dni_in:
                alumno = Alumnos.objects.filter(dni=dni_in).first()

            if alumno:
                # Update only provided values; required fields always provided
                alumno.nombre = nombre
                alumno.latitud = lat
                alumno.longitud = lng
                alumno.localidad = localidad
                email_in = to_text(row.get('email'))
                if email_in != '':
                    alumno.email = email_in
                tel_in = to_text(row.get('telefono'))
                if tel_in != '':
                    alumno.telefono = tel_in
                dom_in = to_text(row.get('domicilio'))
                if dom_in != '':
                    alumno.domicilio = dom_in
                car_in = to_text(row.get('carrera'))
                if car_in != '':
                    alumno.carrera = car_in
                reg_raw = row.get('esregular') or row.get('regular') or row.get('es_regular')
                if reg_raw is not None and to_text(reg_raw) != '':
                    alumno.esRegular = get_bool(reg_raw)
                if fi_parsed:
                    alumno.fecha_inscripcion = fi_parsed
                code_in = to_text(row.get('codigo'))
                if code_in != '':
                    alumno.codigo = code_in
                alumno.full_clean()
                alumno.save()
                updated += 1
            else:
                alumno = Alumnos(
                    nombre=nombre,
                    email=to_text(row.get('email')) or None,
                    telefono=to_text(row.get('telefono')) or None,
                    domicilio=to_text(row.get('domicilio')) or None,
                    localidad=localidad,
                    latitud=lat,
                    longitud=lng,
                    dni=dni_in,
                    codigo=codigo_in,
                    esRegular=get_bool(row.get('esregular') or row.get('regular') or row.get('es_regular')),
                    carrera=to_text(row.get('carrera')) or None,
                    fecha_inscripcion=fi_parsed or datetime.utcnow().date(),
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
        # Leer contenido una sola vez para evitar problemas de puntero en fallbacks
        try:
            content = upload.read()
        except Exception:
            content = None

        # Intentar con openpyxl (preferido)
        try:
            import openpyxl  # type: ignore
            if content is None:
                # Como último recurso, re-lee del archivo
                content = upload.read()
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            processed = False
            for ws in wb.worksheets:
                headers = []
                rows_iter = ws.iter_rows(values_only=True)
                try:
                    first = next(rows_iter)
                except StopIteration:
                    continue
                headers = [str(c or '').strip().lower() for c in first]
                if not any(headers):
                    continue
                for i, row in enumerate(rows_iter, start=2):
                    values = [c if c is not None else '' for c in row]
                    row_norm = { headers[j]: values[j] if j < len(values) else '' for j in range(len(headers)) }
                    upsert_row(row_norm, i)
                processed = True
                break
            if not processed:
                raise Exception('XLSX vacío o sin encabezados válidos')
        except Exception:
            # Fallback a xlrd 1.2.0
            try:
                import xlrd  # type: ignore
                if content is None:
                    content = upload.read()
                wb = xlrd.open_workbook(file_contents=content)
                processed = False
                for si in range(wb.nsheets):
                    sheet = wb.sheet_by_index(si)
                    if sheet.nrows < 2:
                        continue
                    headers = [str(sheet.cell_value(0, c) or '').strip().lower() for c in range(sheet.ncols)]
                    if not any(headers):
                        continue
                    for r in range(1, sheet.nrows):
                        values = [sheet.cell_value(r, c) for c in range(sheet.ncols)]
                        row_norm = { headers[j]: (values[j] if j < len(values) else '') for j in range(len(headers)) }
                        upsert_row(row_norm, r+1)
                    processed = True
                    break
                if not processed:
                    raise Exception('XLSX vacío o sin encabezados válidos')
            except Exception:
                return JsonResponse({"success": False, "error": "No se pudo leer XLSX. Instale openpyxl (sugerido) o xlrd==1.2.0, o suba un CSV."}, status=400)
    else:
        return JsonResponse({"success": False, "error": "Formato no soportado. Use .csv o .xlsx"}, status=400)

    return JsonResponse({"success": True, "created": created, "updated": updated, "errors": errors})
