# In your Clientes/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from Locaciones.models import Localidades
from Vendedores.models import Vendedores
from Transportes.models import Transportes

RequiredMessage = 'Este campo es requerido.'

class Clientes(models.Model):    
    nombre = models.CharField(max_length=50,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    latitud = models.FloatField(default=0)
    longitud = models.FloatField(default=0)
    telefono = models.CharField(max_length=50,blank=True,null=True)
    webpage = models.CharField(max_length=50,blank=True,null=True)
    domicilio = models.CharField(max_length=35,blank=True,null=True)
    localidad = models.ForeignKey(Localidades,blank=False,null=False)
    dni = models.CharField(max_length=20,blank=True,null=True)
    email = models.CharField(max_length=150,blank=True,null=True)
    codigo = models.CharField(max_length=8)
    razonSocial = models.CharField(max_length=50,blank=True,null=True)
    debaja = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre

    def json(self):
        return {
            "pk": self.pk,
            "nombre": self.nombre,
        }