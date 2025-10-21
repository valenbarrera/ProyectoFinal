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

from Locaciones.models import Localidades, Provincias
from ..models import Alumnos
from Datos_domicilio.models import Datos_domicilio
from Datos_familiares.models import Datos_familiares
from Datos_ocupacionales.models import Datos_ocupacionales
from utilities.geocoding import geocode_address, geocode_localidad


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


def ensure_provincia(nombre):
    # Si no viene provincia, usar un placeholder 'N/D'
    name = to_text(nombre) or 'N/D'
    prov = Provincias.objects.filter(nombre__iexact=name).first()
    if prov:
        return prov
    prov = Provincias(nombre=name, latitud=0, longitud=0)
    prov.full_clean()
    prov.save()
    return prov


def ensure_localidad_by_names(localidad_nombre, provincia_nombre):
    ln = to_text(localidad_nombre)
    pn = to_text(provincia_nombre)
    if not ln:
        return None
    qs = Localidades.objects.filter(nombre__iexact=ln)
    if pn:
        qs = qs.filter(provincia__nombre__iexact=pn)
    loc = qs.first()
    if loc:
        return loc
    # Crear provincia (usa 'N/D' si pn vacío) y luego la localidad
    prov = ensure_provincia(pn)
    loc = Localidades(nombre=ln, provincia=prov)
    # Intentar geocodificar la localidad al crearla
    try:
        coords = geocode_localidad(ln, prov.nombre)
        if coords:
            lat, lon = coords
            loc.latitud = lat
            loc.longitud = lon
    except Exception:
        pass
    loc.full_clean()
    loc.save()
    return loc


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
        # Campos de alumno
        nombre = to_text(row.get('nombre'))
        apellido = to_text(row.get('apellido'))
        if not (nombre and apellido):
            raise ValueError('Falta nombre o apellido')

        nro_documento = to_text(row.get('nro_documento'))
        if not nro_documento:
            raise ValueError('Falta nro_documento')

        genero = to_text(row.get('género') or row.get('genero'))
        pais_documento = to_text(row.get('pais_documento'))
        tipo_documento = to_text(row.get('tipo_documento'))
        nacionalidad = to_text(row.get('nacionalidad'))
        cuil = to_text(row.get('cuil'))
        pueblos_originarios = to_text(row.get('pueblos_originarios'))
        obra_social = to_text(row.get('obra_social'))
        telefono = to_text(row.get('telefono'))
        email = to_text(row.get('email'))
        carrera = to_text(row.get('carrera'))
        esRegular = get_bool(row.get('esregular') or row.get('es_regular'))
        fi_raw = row.get('fecha_inscripcion') or row.get('fecha') or row.get('fecha inscripcion')
        fi_parsed = parse_date_safe(fi_raw) or timezone.now().date()

        # Upsert Alumno por nro_documento
        alumno = Alumnos.objects.filter(nro_documento=nro_documento).first()
        if alumno:
            alumno.nombre = nombre
            alumno.apellido = apellido
            alumno.genero = genero
            alumno.pais_documento = pais_documento
            alumno.tipo_documento = tipo_documento
            alumno.nro_documento = nro_documento
            alumno.nacionalidad = nacionalidad
            alumno.cuil = cuil
            alumno.pueblos_originarios = pueblos_originarios
            alumno.obra_social = obra_social
            alumno.telefono = telefono
            alumno.email = email
            alumno.esRegular = esRegular
            alumno.carrera = carrera
            alumno.fecha_inscripcion = fi_parsed
            alumno.full_clean()
            alumno.save()
            counters['updated'] += 1
        else:
            alumno = Alumnos(
                nombre=nombre,
                apellido=apellido,
                genero=genero,
                pais_documento=pais_documento,
                tipo_documento=tipo_documento,
                nro_documento=nro_documento,
                nacionalidad=nacionalidad,
                cuil=cuil,
                pueblos_originarios=pueblos_originarios,
                obra_social=obra_social,
                telefono=telefono,
                email=email,
                codigo=timezone.now().strftime('%y%m%d%H%M%S'),
                esRegular=esRegular,
                carrera=carrera,
                fecha_inscripcion=fi_parsed,
            )
            alumno.full_clean()
            alumno.save()
            counters['created'] += 1

        # Domicilios (procedencia y estudio)
        loc_proc = ensure_localidad_by_names(row.get('localidad_procedencia'), row.get('provincia_procedencia'))
        loc_est = ensure_localidad_by_names(row.get('localidad_estudio'), row.get('provincia_estudio'))
        def to_float(v):
            if v in (None, ''):
                return 0.0
            try:
                return float(v) if isinstance(v, (int, float)) else float(to_text(v).replace(',', '.'))
            except Exception:
                return 0.0
        # Evitar get_or_create para no guardar con FKs obligatorias vacías
        dom = Datos_domicilio.objects.filter(alumno=alumno).first()
        if dom is None:
            dom = Datos_domicilio(alumno=alumno)
        dom.calle_procedencia = to_text(row.get('calle_procedencia')) or 'N/D'
        dom.nro_procedencia = to_text(row.get('nro_procedencia')) or 'S/N'
        # Geocodificar procedencia a partir de dirección
        try:
            loc_name_p = (loc_proc.nombre if loc_proc else to_text(row.get('localidad_procedencia') or row.get('localidad')))
            prov_name_p = (loc_proc.provincia.nombre if loc_proc and getattr(loc_proc, 'provincia', None) else to_text(row.get('provincia_procedencia') or row.get('provincia')))
            coords_p = geocode_address(dom.calle_procedencia, dom.nro_procedencia, loc_name_p, prov_name_p)
        except Exception:
            coords_p = None
        if coords_p:
            dom.lat_procedencia, dom.long_procedencia = coords_p
        else:
            dom.lat_procedencia = 0.0
            dom.long_procedencia = 0.0
        if loc_proc:
            dom.localidad_procedencia = loc_proc
        dom.calle_estudio = to_text(row.get('calle_estudio')) or 'N/D'
        dom.nro_estudio = to_text(row.get('nro_estudio')) or 'S/N'
        # Geocodificar estudio a partir de dirección
        try:
            loc_name_e = (loc_est.nombre if loc_est else to_text(row.get('localidad_estudio') or row.get('localidad')))
            prov_name_e = (loc_est.provincia.nombre if loc_est and getattr(loc_est, 'provincia', None) else to_text(row.get('provincia_estudio') or row.get('provincia')))
            coords_e = geocode_address(dom.calle_estudio, dom.nro_estudio, loc_name_e, prov_name_e)
        except Exception:
            coords_e = None
        if coords_e:
            dom.lat_estudio, dom.long_estudio = coords_e
        else:
            dom.lat_estudio = 0.0
            dom.long_estudio = 0.0
        if loc_est:
            dom.localidad_estudio = loc_est
        dom.full_clean()
        dom.save()

        # Datos familiares
        fam = Datos_familiares.objects.filter(alumno=alumno).first()
        if fam is None:
            fam = Datos_familiares(alumno=alumno)
        fam.estado_civil = to_text(row.get('estado_civil')) or 'N/D'
        try:
            fam.cant_hijos = int(float(row.get('cant_hijos'))) if row.get('cant_hijos') not in (None, '') else 0
        except Exception:
            fam.cant_hijos = 0
        fam.nombre_padre = to_text(row.get('nombre_padre')) or 'N/D'
        fam.apellido_padre = to_text(row.get('apellido_padre')) or 'N/D'
        fam.vive_padre = get_bool(row.get('vive_padre'))
        fam.nivel_estudio_padre = to_text(row.get('nivel_estudio_padre')) or 'N/D'
        fam.nombre_madre = to_text(row.get('nombre_madre')) or 'N/D'
        fam.apellido_madre = to_text(row.get('apellido_madre')) or 'N/D'
        fam.vive_madre = get_bool(row.get('vive_madre'))
        fam.nivel_estudio_madre = to_text(row.get('nivel_estudio_madre')) or 'N/D'
        fam.full_clean()
        fam.save()

        # Datos ocupacionales
        ocu = Datos_ocupacionales.objects.filter(alumno=alumno).first()
        if ocu is None:
            ocu = Datos_ocupacionales(alumno=alumno)
        ocu.colegio_secundario = to_text(row.get('colegio_secundario')) or 'N/D'
        try:
            ocu.anio_egreso_secundario = int(float(row.get('anio_egreso_secundario'))) if row.get('anio_egreso_secundario') not in (None, '') else 0
        except Exception:
            ocu.anio_egreso_secundario = 0
        ocu.condicion_laboral = to_text(row.get('condicion_laboral')) or 'N/D'
        ocu.full_clean()
        ocu.save()
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
