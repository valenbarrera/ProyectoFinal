import React, {Component} from 'react';
import axios from "axios";

import api from '../../../api/';

import Create from "./Create.js"
import Edit from "./Edit.js"
import Delete from "./Delete.js"
import Detail from "./Detail.js"
import Lock from "./Lock.js"
import Unlock from "./Unlock.js"

import UnsTable from "../../../components/UnsTable/"



class Usuarios extends Component {
    constructor() {
    super();
    this.state = {
       columns: [
            {
                Header: "id",
                id:"pk",
                accessor: "pk",
                width: 100,
                show:false,
            },
            {
                Header: "Nombre",
                id: "nombre",
                accessor: d => d.nombre,
                show:true,
                width: 300,
            },
            {
                Header: "Email",
                id:"email",
                accessor: "email",
                filterable:true,
                show:true,
            },
            {
                Header: "Fecha Registro",
                id:"date_joined",
                accessor: d => new Date(Date.parse(d.date_joined)).toLocaleString(),                
                filterable:true,
                width: 200,
                show:true,
            },
            {
                Header: "Activo",
                id:"is_active",
                accessor: d => (d.is_active?"SI":"NO"),
                filterable:true,
                width: 100,
                show:true,
            },
        ]
    };
}

render() {
    const { data, pages, loading } = this.state;
    return (
        <UnsTable
        buttons={[
            {
                create:true,
                permission:'usuarios_new',
                component:Create,
            },
            {
                edit:true,
                permission:'usuarios_edit',
                component:Edit,
            },
            {   
                detail:true,
                permission:'usuarios_detail',
                component:Detail,
            },
            {
                edit:true,
                permission:'usuarios_habilitar',
                component:Lock,
            },
            {
                edit:true,
                permission:'usuarios_deshabilitar',
                component:Unlock,
            },
            {
                edit:true,
                permission:'usuarios_delete',
                component:Delete,
            },
        ]}
        
        apiUrl={api.usuarios.usuarios.list}
        columns={this.state.columns}
        exportUrl={api.usuarios.usuarios.export}
        title={"Usuarios"}
         />
    );
    }
}

export default Usuarios;
