from django.db import models
from Alumnos.models import Alumnos

RequiredMessage = 'Este campo es requerido.'

class Datos_ocupacionales(models.Model):
    alumno = models.ForeignKey(Alumnos, on_delete=models.CASCADE)
    colegio_secundario = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    anio_egreso_secundario = models.IntegerField(blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    condicion_laboral = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})

    def __str__(self):
        return f"Datos ocupacionales #{self.pk}"

    def json(self):
        return {
            'pk': self.pk,
            'alumno_id': self.alumno_id,
            'colegio_secundario': self.colegio_secundario,
            'anio_egreso_secundario': self.anio_egreso_secundario,
            'condicion_laboral': self.condicion_laboral,
        }
