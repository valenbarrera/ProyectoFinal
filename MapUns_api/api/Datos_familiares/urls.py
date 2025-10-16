from django.conf.urls import url

from . import Datos_familiares

urlpatterns = [
    url(r'^datos_familiares/list/', Datos_familiares.List),
]
