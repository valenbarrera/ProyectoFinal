from django.conf.urls import url,include

from . import Vendedores

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^vendedores/select/', Vendedores.Select),
]