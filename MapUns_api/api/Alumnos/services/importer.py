from __future__ import unicode_literals

import csv
import io
from datetime import datetime, date

from django.utils import timezone

try:
    import openpyxl  # type: ignore
except Exception:  # pragma: no cover
    openpyxl = None

try:
    import xlrd  # type: ignore
except Exception:  # pragma: no cover
    xlrd = None

from Locaciones.models import Localidades
from ..models import Alumnos


def to_text(val):
    if val is None:
        return ''
    try:
        if isinstance(val, float) and val.is_integer():
            val = int(val)
        return (str(val)).strip()
    except Exception:  # pragma: no cover
        try:
            return (unicode(val)).strip()  # py2 safety
        except Exception:
            return ''


def get_bool(val):
    if val is None:
        return False
    s = to_text(val).lower()
    return s in ('1', 'true', 't', 'si', 'sí', 'y', 'yes', 's')


def parse_date_safe(val):
    if not val:
        return None
    if isinstance(val, (datetime, date)):
        return val.date() if isinstance(val, datetime) else val
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(to_text(val), fmt).date()
        except Exception:
            pass
    return None


def resolve_localidad(row):
    loc_id = (
        row.get('localidad_id') or row.get('localidadid') or row.get('localidad id') or
        row.get('id_localidad') or row.get('id localidad') or row.get('localidad_pk')
    )
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


def _upsert_row(row, counters, errors):
    try:
        nombre = to_text(row.get('nombre'))
        if not nombre:
            raise ValueError('Falta nombre')

        # normalizar lat/lon
        if 'latitud' not in row and 'lat' in row:
            row['latitud'] = row.get('lat')
        if 'longitud' not in row and (row.get('lng') or row.get('long') or row.get('longitude')):
            row['longitud'] = row.get('lng') or row.get('long') or row.get('longitude')

        lat = row.get('latitud'); lng = row.get('longitud')
        if lat in (None, '') or lng in (None, ''):
            raise ValueError('Falta latitud/longitud')

        try:
            lat = float(lat) if isinstance(lat, (int, float)) else float(to_text(lat).replace(',', '.'))
            lng = float(lng) if isinstance(lng, (int, float)) else float(to_text(lng).replace(',', '.'))
        except Exception:
            raise ValueError('Lat/Lon inválidos')

        localidad = resolve_localidad(row)
        if not localidad:
            raise ValueError('Localidad no encontrada')

        dni_in = to_text(row.get('dni')) or None
        codigo_in = to_text(row.get('codigo'))
        if not codigo_in:
            codigo_in = (dni_in[:8] if dni_in else '') or (timezone.now().strftime('%y%m%d%H'))

        fi_raw = row.get('fecha_inscripcion') or row.get('fecha') or row.get('fecha inscripcion') or row.get('fecha_de_inscripcion')
        fi_parsed = parse_date_safe(fi_raw) or timezone.now().date()

        # Upsert por DNI
        alumno = Alumnos.objects.filter(dni=dni_in).first() if dni_in else None
        if alumno:
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
            if to_text(reg_raw) != '':
                alumno.esRegular = get_bool(reg_raw)
            if fi_parsed:
                alumno.fecha_inscripcion = fi_parsed
            code_in = to_text(row.get('codigo'))
            if code_in != '':
                alumno.codigo = code_in
            alumno.full_clean()
            alumno.save()
            counters['updated'] += 1
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
                fecha_inscripcion=fi_parsed,
            )
            alumno.full_clean()
            alumno.save()
            counters['created'] += 1
    except Exception as e:
        # Se espera que 'row' tenga una clave especial '_row_index' para reporte
        errors.append({"row": row.get('_row_index'), "error": str(e)})


def import_alumnos(upload):
    if not upload:
        return {"created": 0, "updated": 0, "errors": [{"row": 0, "error": "Falta archivo"}]}

    name = upload.name.lower()
    counters = {"created": 0, "updated": 0}
    errors = []

    if name.endswith('.csv'):
        data = upload.read()
        try:
            text = data.decode('utf-8-sig')
        except Exception:
            text = data.decode('latin-1')
        reader = csv.DictReader(io.StringIO(text))
        for idx, row in enumerate(reader, start=2):
            row_norm = { (k or '').strip().lower(): (v if v is not None else '') for k, v in row.items() }
            row_norm['_row_index'] = idx
            _upsert_row(row_norm, counters, errors)
        return {"created": counters['created'], "updated": counters['updated'], "errors": errors}

    if name.endswith('.xlsx'):
        content = None
        try:
            content = upload.read()
        except Exception:
            content = None

        # openpyxl primero
        if openpyxl is not None:
            try:
                wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
                processed = False
                for ws in wb.worksheets:
                    rows = ws.iter_rows(values_only=True)
                    try:
                        headers = next(rows)
                    except StopIteration:
                        continue
                    headers = [to_text(c).lower() for c in headers]
                    if not any(headers):
                        continue
                    for r_index, row in enumerate(rows, start=2):
                        values = [c if c is not None else '' for c in row]
                        row_norm = { headers[j]: values[j] if j < len(values) else '' for j in range(len(headers)) }
                        row_norm['_row_index'] = r_index
                        _upsert_row(row_norm, counters, errors)
                    processed = True
                    break
                if processed:
                    return {"created": counters['created'], "updated": counters['updated'], "errors": errors}
            except Exception:
                pass

        # fallback xlrd
        if xlrd is not None:
            try:
                wb = xlrd.open_workbook(file_contents=content)
                for si in range(wb.nsheets):
                    sheet = wb.sheet_by_index(si)
                    if sheet.nrows < 2:
                        continue
                    headers = [to_text(sheet.cell_value(0, c)).lower() for c in range(sheet.ncols)]
                    if not any(headers):
                        continue
                    for r in range(1, sheet.nrows):
                        values = [sheet.cell_value(r, c) for c in range(sheet.ncols)]
                        row_norm = { headers[j]: (values[j] if j < len(values) else '') for j in range(len(headers)) }
                        row_norm['_row_index'] = r + 1
                        _upsert_row(row_norm, counters, errors)
                    return {"created": counters['created'], "updated": counters['updated'], "errors": errors}
            except Exception:
                pass

        return {"created": 0, "updated": 0, "errors": [{"row": 0, "error": "No se pudo leer XLSX. Instale openpyxl (sugerido) o xlrd==1.2.0, o suba un CSV."}]}

    return {"created": 0, "updated": 0, "errors": [{"row": 0, "error": "Formato no soportado"}]}

