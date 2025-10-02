import React, { Component } from 'react';
import axios from "axios";

import api from '../../../api/';

import Create from "./Create.js"
import Edit from "./Edit.js"
import Detail from "./Detail.js"
import Delete from "./Delete.js"

import UnsTable from "../../../components/UnsTable/"



class Grupos extends Component {
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
                    Header: "Padre",
                    id: "padre__nombre",
                    accessor: d => d.padre__nombre,
                    show: true,
                    width: 200
                },
                {
                    Header: "Cant. Hijos",
                    id: "hijos_count",
                    accessor: d => d.hijos_count,
                    show: true,
                    className: "text-right",
                    width: 100
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
                        create: true,
                        component: Create,
                        permission: 'grupos_add',
                    },
                    {
                        edit: true,
                        component: Edit,
                        permission: 'grupos_edit',
                    },
                    {
                        detail: true,
                        component: Detail,
                        permission: 'grupos_detail',
                    },
                    {
                        edit: true,
                        component: Delete,
                        permission: 'grupos_delete',
                    }
                ]}
                apiUrl={api.usuarios.grupos.list}
                columns={this.state.columns}
                exportUrl={api.usuarios.grupos.export}
                title={"Grupos"}
            />
        );
    }
}

export default Grupos;
