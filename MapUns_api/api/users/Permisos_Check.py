from .models import Permiso, Perfil
from django.contrib.auth.models import User

from django.core.exceptions import PermissionDenied


def TienePermiso(obj_user, str_nombre):
    obj_permiso = ExistePermiso(str_nombre)
    if obj_permiso != False:
        obj_perfil = Perfil.objects.get(user_id = obj_user.pk)
        if obj_perfil.permisos.filter(nombre = str_nombre).exists() or obj_perfil.grupo.permisos.filter(nombre = str_nombre).exists():
            return True
        else:
            return False
    else:
        return False

def ExistePermiso(str_nombre):
    obj_permiso = Permiso.objects.get(nombre = str_nombre)
    if obj_permiso != None:
        return obj_permiso
    else:
        return False

def ListaPermisos(obj_user):
    # Si es superusuario, devolver todos los permisos sin requerir Perfil
    if obj_user.is_superuser:
        ar = [obj_permiso['nombre'] for obj_permiso in Permiso.objects.values("nombre")]
        ar.append('superadmin')
        return ar
    # Para usuarios comunes, intentar obtener Perfil; si no existe, devolver lista vacía
    try:
        perfil = Perfil.objects.get(user_id=obj_user.pk)
    except Perfil.DoesNotExist:
        return []
    return perfil.GetPermisos()

def CheckPermisos(str_nombre):
    def _method_wrapper(view_method):
        def _arguments_wrapper(request, *args, **kwargs):
            if request.user.is_superuser or TienePermiso(request.user, str_nombre):
                return view_method(request, *args, **kwargs)
            else:
                raise PermissionDenied
        return _arguments_wrapper
    return _method_wrapper
