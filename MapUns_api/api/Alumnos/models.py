# In your Alumnos/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from Locaciones.models import Localidades

RequiredMessage = 'Este campo es requerido.'

class Alumnos(models.Model):    
    nombre = models.CharField(max_length=50,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    latitud = models.FloatField(default=0)
    longitud = models.FloatField(default=0)
    telefono = models.CharField(max_length=50,blank=True,null=True)
    domicilio = models.CharField(max_length=35,blank=True,null=True)
    localidad = models.ForeignKey(Localidades,blank=False,null=False)
    dni = models.CharField(max_length=20,blank=True,null=True)
    email = models.CharField(max_length=150,blank=True,null=True)
    codigo = models.CharField(max_length=8)
    esRegular = models.BooleanField(default=False)
    carrera = models.CharField(max_length=256,blank=True,null=True)
    fecha_inscripcion = models.DateField(default=timezone.now)

    def __str__(self):
        return self.nombre

    def json(self):
        return {
            "pk": self.pk,
            "nombre": self.nombre,
        }