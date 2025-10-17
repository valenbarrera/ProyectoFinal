import json, math
from django.shortcuts import render
from django.core.exceptions import ValidationError

from django.http.response import JsonResponse

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from django.db.models import Value, Q
from django.db.models.functions import Concat

from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.authtoken.models import Token

from utilities import list_utils

from .models import Perfil, Permiso, Grupo
from users.Permisos_Check import CheckPermisos, ListaPermisos

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = json.loads(request.GET.get('data'))
    db_query = User.objects.annotate(nombre=Concat('last_name',Value(', '),'first_name')).filter(perfil__debaja=False)

    if not request.user.is_superuser:
        db_query = db_query.filter(is_superuser=False)

    int_page_size = obj_data['table']['pageSize']
    int_page = obj_data['table']['page']
    ar_filters = obj_data['table']['filtered']
    ar_sorts = obj_data['table']['sorted']
    ar_columns = ['pk','nombre','username','email','is_active','date_joined']
    
    db_filters = None
    for obj_filter in ar_filters:
        str_field_filter = obj_filter['id'] + "__icontains"
        if db_filters != None:
            db_filters = Q(db_filters & Q(**{str_field_filter: obj_filter['value']}))
        else:
            db_filters = Q(**{str_field_filter: obj_filter['value']})

    if db_filters != None:
        db_query = db_query.filter(db_filters)

    pages = math.ceil(db_query.count() / int_page_size)

    start = int_page * int_page_size
    length = int_page_size * (int_page + 1)

    db_query = db_query.order_by("pk")    
    for obj_sort in ar_sorts:
        if obj_sort['desc']:
            db_query = db_query.order_by("-" + obj_sort['id'])
        else:
            db_query = db_query.order_by(obj_sort['id']) 

    db_query = db_query[start:length]

    return JsonResponse({"pages":pages, "rows":list(db_query.values(*ar_columns))})

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    db_query = User.objects.annotate(nombre = Concat('last_name', Value(', '), 'first_name'))
    ar_reply = list_utils.obj_filtered_list(db_query, 1, 1, ['pk', 'nombre'], [], [], False)['list']
    return JsonResponse({"rows": ar_reply})

@api_view(['POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Create(request):
    obj_data = json.loads(request.body)
    dict_errors = validate_user_data(obj_data, None)
    if len(dict_errors) == 0:
        int_grupo_id = int(obj_data.get('grupo_id'))
        
        new_obj = User.objects.create_user(
            username = obj_data.get('username'), 
            email = obj_data.get('email'),    
            password = obj_data.get('password'),
            first_name = obj_data.get('first_name'),
            last_name = obj_data.get('last_name'),
        )
        new_obj.save()

        ar_permisos = []
        str_permisos = obj_data.get('permisos')
        if str_permisos != None and str_permisos != "":
            ar_permisos = str_permisos.split(',')

        ar_permisos_grupo = Grupo.objects.get(pk = int_grupo_id).AllPermisos()
        if len(ar_permisos_grupo) > 0:
            ar_permisos = [x for x in ar_permisos if x not in ar_permisos_grupo]

        obj_perfil = Perfil(user = new_obj)
        obj_perfil.grupo_id = int_grupo_id
        obj_perfil.save()

        obj_perfil.permisos = ar_permisos
        obj_perfil.save()
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"success": False, "errors": dict_errors})


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Edit(request, id):
    if request.method == "POST":
        obj_data = json.loads(request.body)
        obj = User.objects.get(pk = id)
        obj_perfil = obj.perfil
        dict_errors = validate_user_data(obj_data, obj)

        if len(dict_errors) == 0:
            obj.username = obj_data.get('username')
            obj.email = obj_data.get('email')
            obj.first_name = obj_data.get('first_name')
            obj.last_name = obj_data.get('last_name')
            obj.save()

            str_password = obj_data.get('password')
            if str_password != "" and str_password != None:
                obj.set_password(str_password)
                obj.save()

            int_grupo_id = int(obj_data.get('grupo_id'))

            ar_permisos = []
            str_permisos = obj_data.get('permisos')
            if str_permisos != None and str_permisos != "":
                ar_permisos = str_permisos.split(',')

            ar_permisos_grupo = Grupo.objects.get(pk = int_grupo_id).AllPermisos()
            if len(ar_permisos_grupo) > 0:
                ar_permisos = [x for x in ar_permisos if x not in ar_permisos_grupo]    

            obj_perfil.grupo_id = int_grupo_id
            obj_perfil.permisos = ar_permisos
            obj_perfil.save()

            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "errors": dict_errors})
    else:
        obj = User.objects.get(pk = id)
        obj_perfil = obj.perfil
        ar_permisos = [str(obj_permiso['pk']) for obj_permiso in obj_perfil.permisos.values("pk")]
        return JsonResponse({
            "pk": obj.pk,
            "username": obj.username,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "email": obj.email,
            "grupo_id": obj_perfil.grupo.pk,
            "permisos": ar_permisos,
        })


def Login(request):
    if request.method == "POST":
        obj_data = json.loads(request.body.decode('utf-8'))
        str_username = obj_data.get('username')
        str_password = obj_data.get('password')
        dict_errors = dict()
        
        if str_username == None or str_username == "":
            dict_errors["username"] = "Este campo es requerido."
        
        if str_password == None or str_password == "":
            dict_errors["password"] = "Este campo es requerido."
        
        if len(dict_errors) == 0:
            obj_user = authenticate(username=str_username, password=str_password)
            if not obj_user:
                dict_errors["global"] = "El usuario y/o la contraseña son incorrectos."
                return JsonResponse({"success": False, "errors": dict_errors})
            token, created = Token.objects.get_or_create(user=obj_user)
            # Mostrar un display amigable aunque no tenga Perfil
            try:
                display = str(obj_user.perfil)
            except Exception:
                display = (obj_user.get_full_name() or obj_user.username)
            return JsonResponse({"success": True, "token": token.key, "permisos": ListaPermisos(obj_user), "display": display})
        else:
            return JsonResponse({"success": False, "errors": dict_errors})
    else:
        pass


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def GetPermissions(request):
    return JsonResponse({"success": True, "permisos": ListaPermisos(request.user)})

def LoginCheck(request):
    if request.method == "POST":
        try:
            obj_data = json.loads(request.body.decode('utf-8'))
            token = obj_data.get('Token', None)
            
            if token != None:
                try:
                    token_obj = Token.objects.get(key=token)
                    response_data = {
                        "success": True, 
                        "permisos": ListaPermisos(token_obj.user)
                    }
                    return JsonResponse(response_data)
                except Token.DoesNotExist:
                    return JsonResponse({"success": False})
            else:
                return JsonResponse({"success": False})
        except Exception as e:
            return JsonResponse({"success": False})
    else:
        return JsonResponse({"success": False})

def Logout(request):
    if request.method == "POST":
        obj_data = json.loads(request.body)
        try:
            token = obj_data.get('Token', None)
            if token != None:
                token_obj = Token.objects.get(key = token)
                token_obj.delete()
            return JsonResponse({"success": True})
        except:
            return JsonResponse({"success": True})
    else:
        pass


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Permisos(request, id):
    obj = User.objects.get(pk=id)
    obj_perfil = obj.perfil
    if request.method == "POST":
        obj_data = json.loads(request.body)
        obj_data['user_id'] = id
        if obj_data['permisos'] != "" and obj_data['permisos'] != None:
            obj_data['permisos'] = obj_data['permisos'].split(',')
        dict_errors = dict()
        try:
            for attr, value in obj_data.items(): 
                setattr(obj_perfil, attr, value)
            obj_perfil.full_clean()
            obj_perfil.save()
            return JsonResponse({"success": True})
        except ValidationError as e:
            for v in e:
                dict_errors[v[0]] = v[1][0]
            return JsonResponse({"success": False,"errors":dict_errors})
    else:
        ar_permisos = [str(obj_permiso['pk']) for obj_permiso in obj_perfil.permisos.values("pk")]
        return JsonResponse({"Permisos": ar_permisos})


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Delete(request, id):
    if request.method == "POST":
        try:
            obj = User.objects.get(pk=id)
            obj_perfil = obj.perfil
            obj_perfil.debaja = True
            obj_perfil.save()
            obj.is_active = False
            obj.save()
            return JsonResponse({"success": True})
        except:
            return JsonResponse({"success": False})
    else:
        obj = User.objects.get(pk=id)
        obj_perfil = obj.perfil
        ar_permisos = [str(obj_permiso['pk']) for obj_permiso in obj_perfil.permisos.values("pk")]
        return JsonResponse({
            "username": obj.username,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "email": obj.email,
            "grupo_id": obj.perfil.grupo.pk,
            "permisos": ar_permisos,
        })


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Detail(request, id):
    obj = User.objects.get(pk=id)
    obj_perfil = obj.perfil
    ar_permisos = [str(obj_permiso['pk']) for obj_permiso in obj_perfil.permisos.values("pk")]
    return JsonResponse({
        "username": obj.username,
        "first_name": obj.first_name,
        "last_name": obj.last_name,
        "email": obj.email,
        "grupo_id": obj_perfil.grupo.pk,
        "permisos": ar_permisos,
    })


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Lock(request, id):
    obj = User.objects.get(pk=id)
    if request.method == "POST":
        try:
            obj.is_active = False
            obj.save()
            return JsonResponse({"success": True})
        except:
            return JsonResponse({"success": False})
    else:
        return JsonResponse({
            "username": obj.username,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "email": obj.email,
        })

@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Unlock(request, id):
    obj = User.objects.get(pk=id)
    if request.method == "POST":
        try:
            obj.is_active = True
            obj.save()
            return JsonResponse({"success": True})
        except:
            return JsonResponse({"success": False})
    else:
        return JsonResponse({
            "username":obj.username,
            "first_name":obj.first_name,
            "last_name":obj.last_name,
            "email":obj.email,
        })


@api_view(['GET','POST'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Profile(request):
    if request.method == "POST":
        obj = User.objects.get(pk=request.user.pk)
        dict_errors = dict()
        obj_data = json.loads(request.body)
        
        password = obj_data.get('password')
        password2 = obj_data.get('password2')
        if password != None and password != "" and password2 != None and password2 != "":
            if password != password2:
                dict_errors["password2"] = "Las contraseñas no coinciden."

        if len(dict_errors) == 0:
            try:
                if password != None and password != "":
                    obj.set_password(password)
                    obj.save()
                return JsonResponse({"success": True})
            except:
                return JsonResponse({"success": False, "error": "Ocurrió un error."})
        else:
            return JsonResponse({"success": False, "errors": dict_errors})
    else:
        obj = User.objects.get(pk=request.user.pk)
        obj_perfil = obj.perfil
        ar_permisos = [str(obj_permiso['pk']) for obj_permiso in obj_perfil.permisos.values("pk")]
        return JsonResponse({
            "username": obj.username,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "email": obj.email,
            "grupo_id": obj_perfil.grupo.pk,
            "permisos": ar_permisos,
        })



def validate_user_data(obj_data,user):
    dict_errors = dict()

    username = obj_data.get('username')
    if username == None or username == "":
        dict_errors["username"] = "Este campo es requerido."
    else:
        if user:
            if len(User.objects.filter(username=username)) > 0 and user.username != username:
                dict_errors["username"] = "Este usuario ya esta en uso."
        else:
            if len(User.objects.filter(username=username)) > 0:
                dict_errors["username"] = "Este usuario ya esta en uso."

    if user:
        password = obj_data.get('password')
        password2 = obj_data.get('password2')
        if password != None and password != "" and password2 != None and password2 != "":
            if password != password2:
                dict_errors["password2"] = "Las contraseñas no coinciden."
    else:
        password = obj_data.get('password')
        if password == None or password == "":
            dict_errors["password"] = "Este campo es requerido."

        password2 = obj_data.get('password2')
        if password2 == None or password2 == "":
            dict_errors["password2"] = "Este campo es requerido."

        if password != None and password != "" and password2 != None and password2 != "":
            if password != password2:
                dict_errors["password2"] = "Las contraseñas no coinciden."

    
    email = obj_data.get('email')
    if email == None or email == "":
        dict_errors["email"] = "Este campo es requerido."
    else:
        if user:
            if len(User.objects.filter(email=email)) > 0 and user.email != email:
                dict_errors["email"] = "Este email ya esta en uso."
        else:
            if len(User.objects.filter(email=email)) > 0:
                dict_errors["email"] = "Este email ya esta en uso."
               

    last_name = obj_data.get('last_name')
    if last_name == None or last_name == '0':
        dict_errors["last_name"] = "Este campo es requerido."

    
    first_name = obj_data.get('first_name')
    if first_name == None or first_name == '0':
        dict_errors["first_name"] = "Este campo es requerido."


    grupo = obj_data.get('grupo_id')
    if grupo == None or grupo == '0':
        dict_errors["grupo_id"] = "Este campo es requerido."


    return dict_errors
