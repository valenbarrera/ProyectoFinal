from django.db import models

class Vendedores(models.Model):
    nombre = models.CharField(max_length=255, blank=False, null=False)

    class Meta:
        db_table = "vendedores"

    def __str__(self):
        return self.nombre

    def json(self):
        return {
            "pk": self.pk,
            "nombre": self.nombre,
        }
