from django.shortcuts import render
from django.http import HttpResponse
from django.http.response import JsonResponse

from api.settings import HOST_IP

def Index(request):
    version = "1.02.00"
    return render(request,'index.html',{
        "version": version,
        "AUTOR": "Paradigma S.A.",
        "DESCRIPCION": "MAPSUR - MAPA DE CLIENTES DARSUR",
        "NOMBRE": "MAPSUR",
        "BASE_URL": "http://" + HOST_IP + "/"
    })

def Dashboard(request):
    return JsonResponse({
        "success": True,
        "ejemplo": {
            "percent": 10,
            "value": 1,
        },
    })