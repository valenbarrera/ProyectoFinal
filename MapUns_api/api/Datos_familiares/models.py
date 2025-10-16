from django.db import models
from Alumnos.models import Alumnos

RequiredMessage = 'Este campo es requerido.'

class Datos_familiares(models.Model):
    alumno = models.ForeignKey(Alumnos, on_delete=models.CASCADE)
    estado_civil = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    cant_hijos = models.IntegerField(default=0)

    nombre_padre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    apellido_padre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    vive_padre = models.BooleanField(default=True)
    nivel_estudio_padre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})

    nombre_madre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    apellido_madre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    vive_madre = models.BooleanField(default=True)
    nivel_estudio_madre = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})

    def __str__(self):
        return f"Datos familiares #{self.pk}"

    def json(self):
        return {
            'pk': self.pk,
            'alumno_id': self.alumno_id,
            'estado_civil': self.estado_civil,
            'cant_hijos': self.cant_hijos,
            'nombre_padre': self.nombre_padre,
            'apellido_padre': self.apellido_padre,
            'vive_padre': self.vive_padre,
            'nivel_estudio_padre': self.nivel_estudio_padre,
            'nombre_madre': self.nombre_madre,
            'apellido_madre': self.apellido_madre,
            'vive_madre': self.vive_madre,
            'nivel_estudio_madre': self.nivel_estudio_madre,
        }
