from django.conf.urls import url

from . import Datos_domicilio

urlpatterns = [
    url(r'^datos_domicilio/list/', Datos_domicilio.List),
]

