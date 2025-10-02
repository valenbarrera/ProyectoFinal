from django.conf.urls import url,include

from . import DatosGenerales

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^datosgenerales/select/', DatosGenerales.Select),
]