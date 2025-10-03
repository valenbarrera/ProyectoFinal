from django.db import models

class Provincias(models.Model):
    nombre = models.CharField(max_length=30,null=False,blank=False, unique=True)
    latitud = models.FloatField(default=0)
    longitud = models.FloatField(default=0)
    
    def __str__(self):
        return self.nombre

    def json(self):
        obj_reply = {
            'id': self.pk,
            'nombre': self.nombre
        }
        return obj_reply

class Localidades(models.Model):
    nombre = models.CharField(max_length=100,null=False,blank=False)
    cp = models.CharField(max_length=10,null=True,blank=True)
    provincia = models.ForeignKey(Provincias,null=False,blank=False)
    latitud = models.FloatField(default=0)
    longitud = models.FloatField(default=0)

    def __str__(self):
        return self.nombre

    def json(self):
        obj_reply = {
            'id': self.pk,
            'nombre': self.nombre,
            'cp': self.cp,
            'provincia': self.provincia.nombre,
            'provincia_id': self.provincia_id
        }
        return obj_reply