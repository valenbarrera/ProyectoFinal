from django.conf.urls import url

from . import Datos_ocupacionales

urlpatterns = [
    url(r'^datos_ocupacionales/list/', Datos_ocupacionales.List),
]

