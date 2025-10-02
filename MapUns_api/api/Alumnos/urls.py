from django.conf.urls import url,include

from . import Alumnos

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^alumnos/maplist/', Alumnos.MapList),
    url(r'^alumnos/list/', Alumnos.List),
    url(r'^alumnos/select/', Alumnos.Select),
    url(r'^alumnos/create/', Alumnos.Create),
    url(r'^alumnos/edit/(?P<id>[0-9]+)/', Alumnos.Edit),
    url(r'^alumnos/detail/(?P<id>[0-9]+)/', Alumnos.Detail),
    url(r'^alumnos/delete/(?P<id>[0-9]+)/', Alumnos.Delete),
    url(r'^alumnos/export/', Alumnos.Export),
]