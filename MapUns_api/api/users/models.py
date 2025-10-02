from django.db import models

from django.contrib.auth.models import User


class Permiso(models.Model):
    nombre = models.CharField(max_length=50,blank=False,null=False,unique=True)
    descripcion = models.CharField(max_length=200,blank=False,null=False)
    padre = models.ForeignKey("self",null=True,blank=True,on_delete=models.PROTECT)
    
    def __str__(self):
        return self.nombre

    def json(self):
        return {
            "pk":self.pk,
            "nombre":self.nombre,
            "descripcion":self.descripcion,
            "padre":self.padre.nombre if self.padre else None,
            "padre_id":self.padre.pk if self.padre else None,
        }

class Grupo(models.Model):
    nombre = models.CharField(max_length=50,blank=False,null=False,unique=True)
    usuarios = models.ManyToManyField(User)
    permisos = models.ManyToManyField(Permiso)
    padre = models.ForeignKey("self",null=True,blank=True,on_delete=models.PROTECT,related_query_name='hijos')
    
    def __str__(self):
        return self.nombre

    def AllPermisos(self):
        ar_permisos = []
        for obj_permiso in self.permisos.values("pk"):
            ar_permisos.append(str(obj_permiso['pk']))
        if self.padre:
            ar_permisos_padre = self.padre.AllPermisos()
            for int_permiso in ar_permisos_padre:
                ar_permisos.append(int_permiso)
        return ar_permisos

    def AllPermisosNames(self):
        ar_permisos = []
        for obj_permiso in self.permisos.values("nombre"):
            ar_permisos.append(str(obj_permiso['nombre']))
        if self.padre:
            ar_permisos_padre = self.padre.AllPermisosNames()
            for str_permiso in ar_permisos_padre:
                ar_permisos.append(str_permiso)
        return ar_permisos


    def json(self):
        ar_permisos = [str(obj_permiso['pk']) for obj_permiso in self.permisos.values("pk")]
        obj_reply = {
            "pk":self.pk,
            "nombre":self.nombre,
            "Permisos":ar_permisos
        }
        if self.padre != None:
            obj_reply["padre"] = self.padre.nombre
            obj_reply["padre_id"] = self.padre.pk
        return obj_reply


class Perfil(models.Model):
    user = models.OneToOneField(User,null=False,blank=False, on_delete=models.CASCADE)
    permisos = models.ManyToManyField(Permiso)
    grupo = models.ForeignKey(Grupo,null=False,blank=False, on_delete=models.PROTECT)
    debaja = models.BooleanField(default=False)

    def __str__(self):
        return self.user.last_name + ", " + self.user.first_name

    def GetPermisos(self):
        ar_permisos = []
        if self.grupo:
            ar_permisos = self.grupo.AllPermisosNames()
        for obj_permiso in self.permisos.values("nombre"):
            ar_permisos.append(str(obj_permiso['nombre']))
        return ar_permisos