module.exports = {
    BASE_URL: BASE_URL,
	auth: BASE_URL + "auth/",
	authCheck: BASE_URL + "authcheck/",
	authLogout: BASE_URL + "authlogout/",
	authGetPermissions: BASE_URL + "authgetpermissions/",
	dashboard: {
		stats: BASE_URL + "dashboard/",
	},
    clientes: {
        maplist: BASE_URL + "clientes/maplist/",
        list: BASE_URL + "clientes/list/",
        select: BASE_URL + "clientes/select/",
        create: BASE_URL + "clientes/create/",
        edit: BASE_URL + "clientes/edit/",
        detail: BASE_URL + "clientes/detail/",
        delete: BASE_URL + "clientes/delete/",
        export: BASE_URL + "clientes/export/",
    },
    usuarios: {
        usuarios: {
            list: BASE_URL + "usuarios/list/",
            select: BASE_URL + "usuarios/select/",
            create: BASE_URL + "usuarios/create/",
            edit: BASE_URL + "usuarios/edit/",
            detail: BASE_URL + "usuarios/detail/",
            delete: BASE_URL + "usuarios/delete/",
            export: BASE_URL + "usuarios/export/",
            permisos: BASE_URL + "usuarios/permisos/",
            lock: BASE_URL + "usuarios/lock/",
            unlock: BASE_URL + "usuarios/unlock/",
            perfil: BASE_URL + "usuarios/perfil/",
        },
        permisos: {
            list: BASE_URL + "usuarios/permisos/list/",
            select: BASE_URL + "usuarios/permisos/select/",
            treeselect: BASE_URL + "usuarios/permisos/treeselect/",
            create: BASE_URL + "usuarios/permisos/create/",
            edit: BASE_URL + "usuarios/permisos/edit/",
            delete: BASE_URL + "usuarios/permisos/delete/",
            export: BASE_URL + "usuarios/permisos/export/",
        },
        grupos: {
            list: BASE_URL + "usuarios/grupos/list/",
            select: BASE_URL + "usuarios/grupos/select/",
            create: BASE_URL + "usuarios/grupos/create/",
            edit: BASE_URL + "usuarios/grupos/edit/",
            detail: BASE_URL + "usuarios/grupos/detail/",
            delete: BASE_URL + "usuarios/grupos/delete/",
            export: BASE_URL + "usuarios/grupos/export/",
        }
    },
    locaciones: {
        provincias: {
            list: BASE_URL + "provincias/list/",
            select: BASE_URL + "provincias/select/",
            create: BASE_URL + "provincias/create/",
            edit: BASE_URL + "provincias/edit/",
            detail: BASE_URL + "provincias/detail/",
            delete: BASE_URL + "provincias/delete/",
            export: BASE_URL + "provincias/export/",
        },
        localidades: {
            list: BASE_URL + "localidades/list/",
            select: BASE_URL + "localidades/select/",
            create: BASE_URL + "localidades/create/",
            edit: BASE_URL + "localidades/edit/",
            detail: BASE_URL + "localidades/detail/",
            delete: BASE_URL + "localidades/delete/",
            export: BASE_URL + "localidades/export/",
        }
    },
    vendedores: {
        list: BASE_URL + "vendedores/list/",
        select: BASE_URL + "vendedores/select/",
    },
    transportes: {
        list: BASE_URL + "transportes/list/",
        select: BASE_URL + "transportes/select/",
    },
    depositos: {
        list: BASE_URL + "depositos/list/",
        select: BASE_URL + "depositos/select/",
    },
    lineasProductos: {
        list: BASE_URL + "lineasproductos/list/",
        select: BASE_URL + "lineasproductos/select/",
    },
}