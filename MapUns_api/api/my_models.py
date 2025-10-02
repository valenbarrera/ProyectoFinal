# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class ClientesClientes(models.Model):
    nombre = models.CharField(max_length=50)
    latitud = models.FloatField()
    longitud = models.FloatField()
    telefono = models.CharField(max_length=50, blank=True, null=True)
    webpage = models.CharField(max_length=50, blank=True, null=True)
    domicilio = models.CharField(max_length=35, blank=True, null=True)
    dni = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    codigo = models.CharField(max_length=8)
    razonsocial = models.CharField(db_column='razonSocial', max_length=50, blank=True, null=True)  # Field name made lowercase.
    debaja = models.BooleanField()
    localidad = models.ForeignKey('LocacionesLocalidades', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'Clientes_clientes'


class LocacionesLocalidades(models.Model):
    nombre = models.CharField(max_length=100)
    cp = models.CharField(max_length=10, blank=True, null=True)
    provincia = models.ForeignKey('LocacionesProvincias', models.DO_NOTHING)
    debaja = models.BooleanField()
    latitud = models.FloatField()
    longitud = models.FloatField()

    class Meta:
        managed = False
        db_table = 'Locaciones_localidades'


class LocacionesProvincias(models.Model):
    nombre = models.CharField(unique=True, max_length=30)
    debaja = models.BooleanField()
    latitud = models.FloatField()
    longitud = models.FloatField()

    class Meta:
        managed = False
        db_table = 'Locaciones_provincias'


class UsuariosUserprofile(models.Model):
    id = models.IntegerField()
    nrodoc = models.CharField(db_column='NroDoc', max_length=15)  # Field name made lowercase.
    telefono = models.CharField(db_column='Telefono', max_length=50)  # Field name made lowercase.
    domicilio = models.CharField(db_column='Domicilio', max_length=35)  # Field name made lowercase.
    codpostal = models.CharField(db_column='CodPostal', max_length=10)  # Field name made lowercase.
    descuento = models.FloatField(db_column='Descuento')  # Field name made lowercase.
    recargo = models.FloatField(db_column='Recargo')  # Field name made lowercase.
    iibb = models.FloatField(db_column='IIBB')  # Field name made lowercase.
    domicilioentrega = models.CharField(db_column='DomicilioEntrega', max_length=35)  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=200)  # Field name made lowercase.
    listadeprecios_id = models.IntegerField(db_column='ListaDePrecios_id')  # Field name made lowercase.
    localidad_id = models.IntegerField(db_column='Localidad_id', blank=True, null=True)  # Field name made lowercase.
    tipodoc_id = models.IntegerField(db_column='TipoDoc_id')  # Field name made lowercase.
    transportepredeterminado_id = models.IntegerField(db_column='TransportePredeterminado_id', blank=True, null=True)  # Field name made lowercase.
    usuario_id = models.IntegerField(db_column='Usuario_id')  # Field name made lowercase.
    formapagodefecto_id = models.IntegerField(db_column='FormaPagoDefecto_id', blank=True, null=True)  # Field name made lowercase.
    codusuario = models.CharField(db_column='codUsuario', max_length=6, blank=True, null=True)  # Field name made lowercase.
    porcprecio1 = models.FloatField(db_column='PorcPrecio1')  # Field name made lowercase.
    porcprecio2 = models.FloatField(db_column='PorcPrecio2')  # Field name made lowercase.
    verpreciosconiva = models.BooleanField(db_column='VerPreciosConIVA')  # Field name made lowercase.
    usarmg1 = models.BooleanField(db_column='UsarMG1')  # Field name made lowercase.
    codsituacioniva = models.CharField(db_column='CodSituacionIVA', max_length=2)  # Field name made lowercase.
    localidadesenvio_id = models.IntegerField(db_column='LocalidadesEnvio_id', blank=True, null=True)  # Field name made lowercase.
    idgrupocliente_id = models.IntegerField(db_column='IdGrupoCliente_id', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Usuarios_userprofile'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class AuthtokenToken(models.Model):
    key = models.CharField(primary_key=True, max_length=40)
    created = models.DateTimeField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, unique=True)

    class Meta:
        managed = False
        db_table = 'authtoken_token'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Transportes(models.Model):
    codigo = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    debaja = models.NullBooleanField()
    suspendido = models.NullBooleanField()

    class Meta:
        managed = False
        db_table = 'transportes'


class UsersGrupo(models.Model):
    nombre = models.CharField(unique=True, max_length=50)
    padre = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users_grupo'


class UsersGrupoPermisos(models.Model):
    grupo = models.ForeignKey(UsersGrupo, models.DO_NOTHING)
    permiso = models.ForeignKey('UsersPermiso', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users_grupo_permisos'
        unique_together = (('grupo', 'permiso'),)


class UsersGrupoUsuarios(models.Model):
    grupo = models.ForeignKey(UsersGrupo, models.DO_NOTHING)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users_grupo_usuarios'
        unique_together = (('grupo', 'user'),)


class UsersPerfil(models.Model):
    debaja = models.BooleanField()
    grupo = models.ForeignKey(UsersGrupo, models.DO_NOTHING)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, unique=True)

    class Meta:
        managed = False
        db_table = 'users_perfil'


class UsersPerfilPermisos(models.Model):
    perfil = models.ForeignKey(UsersPerfil, models.DO_NOTHING)
    permiso = models.ForeignKey('UsersPermiso', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users_perfil_permisos'
        unique_together = (('perfil', 'permiso'),)


class UsersPermiso(models.Model):
    nombre = models.CharField(unique=True, max_length=50)
    descripcion = models.CharField(max_length=200)
    padre = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users_permiso'
