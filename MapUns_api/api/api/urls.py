from django.conf.urls import url,include
from django.contrib import admin,auth
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework import routers
from rest_framework.authtoken import views as authviews

from django.views.decorators.csrf import csrf_exempt

router = routers.SimpleRouter()

urlpatterns = [
    url(r'^', include('users.urls')),
    url(r'^', include('main.urls')),
    url(r'^', include('Alumnos.urls')),
    url(r'^', include('Locaciones.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
