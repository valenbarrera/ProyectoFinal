from django.conf.urls import url,include

from . import Localidades,Provincias

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^localidades/list/', Localidades.List),
    url(r'^localidades/select/', Localidades.Select),
    url(r'^localidades/create/', Localidades.Create),
    url(r'^localidades/edit/(?P<id>[0-9]+)/', Localidades.Edit),
    url(r'^localidades/detail/(?P<id>[0-9]+)/', Localidades.Detail),
    url(r'^localidades/delete/(?P<id>[0-9]+)/', Localidades.Delete),
    url(r'^localidades/export/', Localidades.Export),

    
    url(r'^provincias/list/', Provincias.List),
    url(r'^provincias/select/', Provincias.Select),
    url(r'^provincias/create/', Provincias.Create),
    url(r'^provincias/edit/(?P<id>[0-9]+)/', Provincias.Edit),
    url(r'^provincias/detail/(?P<id>[0-9]+)/', Provincias.Detail),
    url(r'^provincias/delete/(?P<id>[0-9]+)/', Provincias.Delete),
    url(r'^provincias/export/', Provincias.Export),
]