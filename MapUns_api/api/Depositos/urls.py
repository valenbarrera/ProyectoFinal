from django.conf.urls import url,include

from . import Depositos

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^depositos/select/', Depositos.Select),
]