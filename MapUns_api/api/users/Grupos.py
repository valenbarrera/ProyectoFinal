from django.shortcuts import render

from django.http import HttpResponse
from django.http.response import JsonResponse

from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes

import json, math

from utilities import list_utils, list_reports

from .models import Grupo

from django.db.models import Q, Count, ProtectedError

def obj_iterate_group_tree(obj_grupo):
    ar_permisos = []
    ar_nombres = []
    if obj_grupo.permisos.count() > 0:
        ar_nombres.append(obj_grupo.nombre)
        for permiso in obj_grupo.permisos.values("pk"):
            ar_permisos.append(str(permiso['pk']))
        if obj_grupo.padre:
            ar_permisos_padre = obj_iterate_group_tree(obj_grupo.padre)
            for str_nombre in ar_permisos_padre['nombres']:
                ar_nombres.append(str_nombre)
            for str_permiso in ar_permisos_padre['permisos']:
                ar_permisos.append(str_permiso)
    return {
        'nombres': ar_nombres, 
        'permisos': ar_permisos
    }

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Grupo.objects.annotate(hijos_count=Count('hijos'))
    return list_utils.obj_tables_default(db_query, obj_data)

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def Select(request):
    db_query = Grupo.objects.all()
    int_exclude = request.GET.get('exclude', None)
    if int_exclude != None:
        int_exclude = int(int_exclude)
        db_query = db_query.exclude(pk=int_exclude)
    ar_reply = []
    for obj_grupo in db_query:
        obj_permisos = obj_iterate_group_tree(obj_grupo)
        str_nombre = ' > '.join(reversed(obj_permisos['nombres']))
        ar_reply.append({
            'pk': obj_grupo.pk, 
            'nombre': str_nombre, 
            'permisos': obj_permisos['permisos']
        })
    return JsonResponse({"rows": ar_reply})

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def TreeListSelect(request):
    db_query = Grupo.objects.filter(padre=None).all()
    ar_reply = []
    for obj_grupo in db_query:
        ar_reply.append({
            'value': str(obj_grupo.pk), 
            'label': obj_grupo.descripcion, 
            'children': get_childs(obj_grupo)
        })
    return JsonResponse({"rows": ar_reply})

@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def Create(request):
    obj_data = json.loads(request.body)
    dict_errors = dict()
    try:
        int_padre_id = obj_data.get('padre_id')
        ar_permisos_padre = []
        if int_padre_id == None or int_padre_id == "" or int_padre_id == '0':
            obj_data['padre_id'] = None
        else:
            int_padre_id = int(int_padre_id)
            obj_grupo = Grupo.objects.get(pk=int_padre_id)
            ar_permisos_padre = obj_iterate_group_tree(obj_grupo)['permisos']
        ar_permisos = []
        str_permisos = obj_data.get('permisos')
        obj_data.pop('permisos', None)
        if str_permisos != None and str_permisos != "":
            ar_permisos = str_permisos.split(', ')
            if len(ar_permisos_padre) > 0:
                ar_permisos = [x for x in ar_permisos if x not in ar_permisos_padre]    
        else:
            ar_permisos = []
        new_obj = Grupo(**obj_data)
        new_obj.full_clean()
        new_obj.save()
        new_obj.permisos = ar_permisos
        new_obj.full_clean()
        new_obj.save()
        return JsonResponse({"success": True, "pk":new_obj.pk})
    except ValidationError as e:
        for v in e:
            dict_errors[v[0]] = v[1][0]
        return JsonResponse({"success": False, "errors": dict_errors})


@api_view(['GET', 'POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def Edit(request, id):
    obj = Grupo.objects.get(pk=id)
    if request.method == "POST":
        obj_data = json.loads(request.body)
        dict_errors = dict()
        try:
            int_padre_id = obj_data.get('padre_id')
            ar_permisos_padre = []
            if int_padre_id == None or int_padre_id == "" or int_padre_id == '0':
                obj_data['padre_id'] = None
            else:
                int_padre_id = int(int_padre_id)
                grupo = Grupo.objects.get(pk=int_padre_id)
                ar_permisos_padre = obj_iterate_group_tree(grupo)['permisos']
            str_permisos = obj_data.get('permisos')
            if str_permisos != None and str_permisos != "":
                obj_data['permisos'] = str_permisos.split(', ')
                if len(ar_permisos_padre) > 0:
                    obj_data['permisos'] = [x for x in obj_data['permisos'] if x not in ar_permisos_padre]    
            else:
                obj_data['permisos'] = []
            for attr, value in obj_data.items(): 
                setattr(obj, attr, value)
            obj.full_clean()
            obj.save()
            return JsonResponse({"success": True})
        except ValidationError as e:
            for v in e:
                dict_errors[v[0]] = v[1][0]
            return JsonResponse({"success": False, "errors": dict_errors})
    else:
        return JsonResponse(obj.json(), safe=False)

@api_view(['GET', 'POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def Detail(request, id):
    obj = Grupo.objects.get(pk=id)
    return JsonResponse(obj.json(), safe=False)


@api_view(['GET', 'POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def Delete(request, id):
    obj = Grupo.objects.get(pk=id)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True})
        except ProtectedError:
            return JsonResponse({"success": False, "error":"El grupo esta siendo utilizado por otros Grupos y/o Usuarios."})
        except:
            return JsonResponse({"success": False, "error":"Ocurrió un error."})
    else:
        return JsonResponse(obj.json(), safe=False)


def Export(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Grupo.objects.annotate(hijos_count=Count('hijos'))
    return list_reports.file_default_export(db_query, 'Grupos', obj_data)
