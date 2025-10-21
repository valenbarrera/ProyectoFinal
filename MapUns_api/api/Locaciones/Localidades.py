from django.shortcuts import render

from django.http import HttpResponse
from django.http.response import JsonResponse

from django.core.exceptions import ValidationError

from django.db.models.functions import Concat
from django.db.models import Q, Count, Value, F, Subquery, OuterRef, IntegerField

from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes

import json, math

from utilities import list_utils, list_reports
from utilities.geocoding import geocode_localidad

from .models import Localidades
from Alumnos.models import Alumnos

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Localidades.objects.filter()
    return list_utils.obj_tables_default(db_query,obj_data)

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    """
    Devuelve localidades para selects con soporte de filtros básicos:
    - provincia_id / provincia / provincia__id / provincia_id__exact: filtra por provincia
    - nombre: búsqueda contains por nombre (para react-select)
    - pks: restringe a ids específicos (para preselección)
    Incluye provincia_id en el payload para permitir filtros del lado del cliente.
    """
    qs = Localidades.objects.all()

    # Filtros por provincia (acepta varios aliases usados por el cliente)
    provincia_id = request.GET.get('provincia_id')
    
    if provincia_id:
        qs = qs.filter(provincia_id=provincia_id)

    # Búsqueda por nombre (react-select usa el nombre del field)
    nombre = request.GET.get('nombre')
    if nombre:
        qs = qs.filter(nombre__icontains=nombre)

    # Restringir a un conjunto de pks cuando corresponde
    pks = request.GET.get('pks')
    if pks:
        try:
            ids = [int(x) for x in pks.split(',') if x.strip()]
            qs = qs.filter(pk__in=ids)
        except ValueError:
            # Si hay valores inválidos, ignora el filtro de pks
            pass

    db_query = qs.values('id', 'nombre', 'provincia_id')
    return JsonResponse({"rows": list(db_query)})



@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Create(request):
    obj_data = json.loads(request.body)
    dict_errors = dict()
    try:        
        new_obj = Localidades(**obj_data)
       
        if not obj_data.get('latitud') and not obj_data.get('longitud'):
            try:
                prov_name = None
                try:
                    prov_name = new_obj.provincia.nombre
                except Exception:
                    if new_obj.provincia_id:
                        from .models import Provincias
                        prov = Provincias.objects.filter(pk=new_obj.provincia_id).first()
                        prov_name = prov.nombre if prov else None
                coords = geocode_localidad(new_obj.nombre, prov_name)
                if coords:
                    new_obj.latitud, new_obj.longitud = coords
            except Exception:
                pass
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
    obj = Localidades.objects.get(pk=id)
    if request.method == "POST":
        obj_data = json.loads(request.body)
        dict_errors = dict()
        try:
            for attr, value in obj_data.items(): 
                setattr(obj, attr, value)
            
            if (('nombre' in obj_data) or ('provincia' in obj_data) or ('provincia_id' in obj_data)) \
               and not ('latitud' in obj_data and 'longitud' in obj_data):
                try:
                    prov_name = None
                    try:
                        prov_name = obj.provincia.nombre
                    except Exception:
                        if obj.provincia_id:
                            from .models import Provincias
                            prov = Provincias.objects.filter(pk=obj.provincia_id).first()
                            prov_name = prov.nombre if prov else None
                    coords = geocode_localidad(obj.nombre, prov_name)
                    if coords:
                        obj.latitud, obj.longitud = coords
                except Exception:
                    pass
            obj.full_clean()
            obj.save()
            return JsonResponse({"success":True})
        except ValidationError as e:
            for v in e:
                dict_errors[v[0]] = v[1][0]
            return JsonResponse({"success":False,"errors":dict_errors})
    else:
        obj = Localidades.objects.get(pk=id)
        return JsonResponse(obj.json(),safe=False)

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Detail(request, id):
    obj = Localidades.objects.get(pk=id)
    return JsonResponse(obj.json(),safe=False)

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Delete(request, id):
    obj = Localidades.objects.get(pk=id)
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
    db_query = Localidades.objects.filter()
    return list_reports.file_default_export(db_query,'Localidades',obj_data)
