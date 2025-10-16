from django.db import models
from Locaciones.models import Localidades
from Alumnos.models import Alumnos

RequiredMessage = 'Este campo es requerido.'

class Datos_domicilio(models.Model):
    alumno = models.ForeignKey(Alumnos, on_delete=models.CASCADE)
    calle_procedencia = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    nro_procedencia = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    lat_procedencia = models.FloatField(default=0)
    long_procedencia = models.FloatField(default=0)
    localidad_procedencia = models.ForeignKey(Localidades, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})

    calle_estudio = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    nro_estudio = models.CharField(max_length=256, blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})
    lat_estudio = models.FloatField(default=0)
    long_estudio = models.FloatField(default=0)
    localidad_estudio = models.ForeignKey(Localidades, related_name='domicilios_estudio', blank=False, null=False, error_messages={'blank': RequiredMessage, 'null': RequiredMessage})

    def __str__(self):
        p = f"{self.calle_procedencia or ''} {self.nro_procedencia or ''}".strip()
        e = f"{self.calle_estudio or ''} {self.nro_estudio or ''}".strip()
        return f"Proc: {p} | Est: {e}" if (p or e) else f"Datos_domicilio #{self.pk}"

    def json(self):
        return {
            'pk': self.pk,
            'alumno_id': self.alumno_id,
            'calle_procedencia': self.calle_procedencia,
            'nro_procedencia': self.nro_procedencia,
            'lat_procedencia': self.lat_procedencia,
            'long_procedencia': self.long_procedencia,
            'localidad_procedencia_id': self.localidad_procedencia_id,
            'calle_estudio': self.calle_estudio,
            'nro_estudio': self.nro_estudio,
            'lat_estudio': self.lat_estudio,
            'long_estudio': self.long_estudio,
            'localidad_estudio_id': self.localidad_estudio_id,
        }
