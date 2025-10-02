# En depositos/models.py

from django.db import models

class Depositos(models.Model):
    """Modelo para la tabla de depósitos."""
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255, unique=True, blank=False, null=False)

    class Meta:
        db_table = "Depositos"

    def __str__(self):
        return self.nombre
