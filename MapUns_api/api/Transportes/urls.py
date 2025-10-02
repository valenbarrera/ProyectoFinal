from django.conf.urls import url,include

from . import Transportes

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^transportes/select/', Transportes.Select),
]
