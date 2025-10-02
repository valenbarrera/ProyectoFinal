export default {
  items: [{
      icon: 'fa fa-map',
      name: 'Mapa',
      url: '/mapa/',
      permission: 'ejemplo_view'
    },
    {
      icon: 'fa fa-user',
      name: 'Clientes',
      url: '/clientes/',
      permission: 'ejemplo_view'
    },
    {
      name: 'Geográficas',
      icon: 'fa fa-map',
      children: [{
          name: 'Localidades',
          url: '/configuracion/geo/localidades/',
          permission: 'ejemplo_view'
        },
        {
          name: 'Provincias',
          url: '/configuracion/geo/provincias/',
          permission: 'ejemplo_view'
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