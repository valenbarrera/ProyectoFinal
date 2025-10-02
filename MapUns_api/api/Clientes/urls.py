from django.conf.urls import url,include

from . import Clientes

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^clientes/maplist/', Clientes.MapList),
    url(r'^clientes/list/', Clientes.List),
    url(r'^clientes/select/', Clientes.Select),
    url(r'^clientes/create/', Clientes.Create),
    url(r'^clientes/edit/(?P<id>[0-9]+)/', Clientes.Edit),
    url(r'^clientes/detail/(?P<id>[0-9]+)/', Clientes.Detail),
    url(r'^clientes/delete/(?P<id>[0-9]+)/', Clientes.Delete),
    url(r'^clientes/export/', Clientes.Export),
]