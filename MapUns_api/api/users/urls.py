from django.conf.urls import url,include
from django.views.decorators.csrf import csrf_exempt

from . import views, Permisos, Grupos

urlpatterns = [
    url(r'^auth/', csrf_exempt(views.Login)),
    url(r'^authcheck/', csrf_exempt(views.LoginCheck)),
    url(r'^authlogout/', csrf_exempt(views.Logout)),
    url(r'^authgetpermissions/', views.GetPermissions),

    url(r'^usuarios/list/', csrf_exempt(views.List)),
    url(r'^usuarios/select/', views.Select),
    url(r'^usuarios/create/', views.Create),
    url(r'^usuarios/edit/(?P<id>[0-9]+)/', views.Edit),
    url(r'^usuarios/delete/(?P<id>[0-9]+)/', views.Delete),
    url(r'^usuarios/detail/(?P<id>[0-9]+)/', views.Detail),
    url(r'^usuarios/lock/(?P<id>[0-9]+)/', views.Lock),
    url(r'^usuarios/unlock/(?P<id>[0-9]+)/', views.Unlock),
    url(r'^usuarios/permisos/(?P<id>[0-9]+)/', views.Permisos),
    
    url(r'^usuarios/perfil/', views.Profile),    

    url(r'^usuarios/permisos/list/', Permisos.List),
    url(r'^usuarios/permisos/select/', Permisos.Select),
    url(r'^usuarios/permisos/treeselect/', Permisos.TreeListSelect),
    url(r'^usuarios/permisos/create/', Permisos.Create),
    url(r'^usuarios/permisos/edit/(?P<id>[0-9]+)/', Permisos.Edit),
    url(r'^usuarios/permisos/delete/(?P<id>[0-9]+)/', Permisos.Delete),
    url(r'^usuarios/permisos/export/', Permisos.Export),

    
    url(r'^usuarios/grupos/list/', Grupos.List),
    url(r'^usuarios/grupos/select/', Grupos.Select),
    url(r'^usuarios/grupos/treeselect/', Grupos.TreeListSelect),
    url(r'^usuarios/grupos/create/', Grupos.Create),
    url(r'^usuarios/grupos/edit/(?P<id>[0-9]+)/', Grupos.Edit),
    url(r'^usuarios/grupos/detail/(?P<id>[0-9]+)/', Grupos.Detail),
    url(r'^usuarios/grupos/delete/(?P<id>[0-9]+)/', Grupos.Delete),
    url(r'^usuarios/grupos/export/', Grupos.Export),
]

