import React, { Component } from 'react';
import axios from "axios";

import api from '../../../api/';

import Create from "./Create.js"
import Edit from "./Edit.js"
import Delete from "./Delete.js"

import ParadigmaTable from "../../../components/ParadigmaTable/"



class Permisos extends Component {
    constructor() {
        super();
        this.state = {
            columns: [
                {
                    Header: "pk",
                    id: "pk",
                    accessor: "pk",
                    width: 100,
                    show: false,
                },
                {
                    Header: "Nombre",
                    id: "nombre",
                    accessor: d => d.nombre,
                    show: true,
                },
                {
                    Header: "Descripcion",
                    id: "descripcion",
                    accessor: d => d.descripcion,
                    show: true,
                },
                {
                    Header: "Padre",
                    id: "padre__nombre",
                    accessor: d => d.padre__nombre,
                    show: true,
                },
            ]
        };
    }

    render() {
        const { data, pages, loading } = this.state;
        return (
            <ParadigmaTable
                buttons={[
                    {
                        create: true,
                        component: Create,
                        permission: 'superadmin',
                    },
                    {
                        edit: true,
                        component: Edit,
                        permission: 'superadmin',
                    },
                    {
                        edit: true,
                        component: Delete,
                        permission: 'superadmin',
                    }
                ]}
                apiUrl={api.usuarios.permisos.list}
                columns={this.state.columns}
                exportUrl={api.usuarios.permisos.export}
                title={"Permisos"}
            />
        );
    }
}

export default Permisos;
