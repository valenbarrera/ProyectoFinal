# DatosGenerales/models.py
from django.db import models
from Clientes.models import Clientes
from Vendedores.models import Vendedores
from Transportes.models import Transportes
from Depositos.models import Depositos

class DatosGenerales(models.Model):
    cliente = models.ForeignKey(Clientes, on_delete=models.CASCADE, related_name="actividades")
    fecha_actividad = models.DateField()
    codigo_vendedor = models.ForeignKey(Vendedores, on_delete=models.SET_NULL, null=True, blank=True)
    codigo_transporte = models.ForeignKey(Transportes, on_delete=models.SET_NULL, null=True, blank=True)
    codigo_deposito = models.ForeignKey(Depositos, on_delete=models.SET_NULL, null=True, blank=True)
    total_gravado = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "datos_generales"

    def __str__(self):
        return "{} - {}".format(self.cliente.nombre, self.fecha_actividad)
