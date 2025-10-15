export default {
  items: [{
      icon: 'fa fa-map',
      name: 'Mapa',
      url: '/mapa/',
      permission: 'superadmin'
    },
    {
      icon: 'fa fa-user',
      name: 'Alumnos',
      url: '/alumnos/',
      permission: 'superadmin'
    },
    {
      name: 'Geográficas',
      icon: 'fa fa-map',
      children: [{
          name: 'Localidades',
          url: '/configuracion/geo/localidades/',
          permission: 'superadmin'
        },
        {
          name: 'Provincias',
          url: '/configuracion/geo/provincias/',
          permission: 'superadmin'
        },
      ]
    },
    {
      name: 'Usuarios',
      icon: 'icon-user',
      children: [{
          name: 'Usuarios',
          url: '/usuarios/usuarios/',
          icon: 'fa fa-user',
          permission: 'usuarios_view'
        },
        {
          name: 'Permisos',
          url: '/usuarios/permisos/',
          icon: 'fa fa-lock',
          permission: 'superadmin'
        },
        {
          name: 'Grupos',
          url: '/usuarios/grupos/',
          icon: 'fa fa-users',
          permission: 'grupos_view'
        },
      ]
    },
  ]
};
