from django.db import models

class Transportes(models.Model):
    nombre = models.CharField(max_length=255, blank=False, null=False)
    debaja = models.BooleanField(default=False)
    suspendido = models.BooleanField(default=False)

    class Meta:
        db_table = "transportes"

    def __str__(self):
        return self.nombre

    def json(self):
        return {
            "pk": self.pk,
            "nombre": self.nombre,
        }
