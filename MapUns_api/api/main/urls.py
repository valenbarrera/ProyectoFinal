from django.conf.urls import url,include

from . import views

from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^$', views.Index),    
    url(r'^dashboard/', views.Dashboard),
]

