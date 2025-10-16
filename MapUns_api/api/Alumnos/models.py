# In your Alumnos/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

RequiredMessage = 'Este campo es requerido.'

class Alumnos(models.Model):    
    nombre = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    apellido = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    genero = models.CharField(max_length=256,blank=True,null=True)
    pais_documento = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    tipo_documento = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    nro_documento = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    nacionalidad = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    cuil = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    pueblos_originarios = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    obra_social = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    telefono = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    email = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    codigo = models.CharField(max_length=256)
    esRegular = models.BooleanField(default=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    carrera = models.CharField(max_length=256,blank=False,null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    fecha_inscripcion = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.nombre} {self.apellido}".strip()

    def json(self):
        return {
            "pk": self.pk,
            "nombre": self.nombre,
            "apellido": self.apellido,
        }
