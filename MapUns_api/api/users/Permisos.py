from django.shortcuts import render

from django.http import HttpResponse
from django.http.response import JsonResponse

from django.core.exceptions import ValidationError

from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes

import json, math


from utilities import list_utils, list_reports

from .models import Permiso

def obj_get_childs(obj_permiso):
    db_query = Permiso.objects.filter(padre = obj_permiso).all()
    ar_reply = []
    for obj_permiso in db_query:
        ar_reply.append({
            'value': str(obj_permiso.pk),
            'label': obj_permiso.descripcion,
            'children': obj_get_childs(obj_permiso)
        })
    return ar_reply


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Permiso.objects
    return list_utils.obj_tables_default(db_query,obj_data)

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    db_query = Permiso.objects
    ar_reply = list_utils.obj_filtered_list(db_query,1,1,['pk','nombre'],[],[],False)['list']
    return JsonResponse({"rows":ar_reply})



@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def TreeListSelect(request):
    db_query = Permiso.objects.filter(padre=None).all()
    ar_reply = []
    for obj_permiso in db_query:
        ar_reply.append({
            'value': str(obj_permiso.pk),
            'label': obj_permiso.descripcion,
            'children': obj_get_childs(obj_permiso)
        })
    return JsonResponse({"rows":ar_reply})

@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Create(request):
    obj_data = json.loads(request.body)
    dict_errors = dict()
    try:
        if obj_data['padre_id'] == '0':
            obj_data['padre_id'] = None
        new_obj = Permiso(**obj_data)
        new_obj.full_clean()
        new_obj.save()
        return JsonResponse({"success": True})
    except ValidationError as e:
        for v in e:
            dict_errors[v[0]] = v[1][0]
        return JsonResponse({"success": False, "errors": dict_errors})


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Edit(request, id):
    obj = Permiso.objects.get(pk=id)
    if request.method == "POST":
        obj_data = json.loads(request.body)
        dict_errors = dict()
        try:
            if obj_data['padre_id'] == '0':
                obj_data['padre_id'] = None
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
        return JsonResponse(obj.json(),safe=False)

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Detail(request, id):
    obj = Permiso.objects.get(pk=id)
    return JsonResponse(obj.json(),safe=False)


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Delete(request, id):
    obj = Permiso.objects.get(pk=id)
    if request.method == "POST":
        try:
            obj.Eliminar()
            return JsonResponse({"success": True})
        except:
            return JsonResponse({"success": False})
    else:
        return JsonResponse(obj.json(),safe=False)


def Export(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = Permiso.objects
    return list_reports.file_default_export(db_query,'Permisos',obj_data)
