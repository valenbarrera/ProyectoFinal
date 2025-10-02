import React, { Component } from 'react';
import axios from "axios";

import api from '../../../api/';

import Create from "./Create.js"
import Edit from "./Edit.js"
import Delete from "./Delete.js"
import Detail from "./Detail.js"

import ParadigmaTable from "../../../components/ParadigmaTable/ParadigmaTable.js"


class Localidades extends Component {
    constructor() {
        super();
        this.state = {
            columns: [
                {
                    Header: "id",
                    id: "pk",
                    accessor: "pk",
                    width: 100,
                    show: false,
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Nombre</div>,
                    id: "nombre",
                    accessor: "nombre",
                    show: true,
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Codigo Postal</div>,
                    id: "cp",
                    accessor: "cp",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Provincia</div>,
                    id: "provincia__nombre",
                    accessor: "provincia__nombre",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
            ],
            filters: {},
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
                        permission: 'ejemplo_add',
                    },
                    {
                        edit: true,
                        component: Edit,
                        permission: 'ejemplo_edit',
                    },
                    {
                        detail: true,
                        component: Detail,
                        permission: 'ejemplo_detail',
                    },
                    {
                        edit: true,
                        component: Delete,
                        permission: 'ejemplo_delete',
                    }
                ]}
                apiUrl={api.locaciones.localidades.list}
                columns={this.state.columns}
                exportUrl={api.locaciones.localidades.export}
                title={"Localidades"}
                filters={this.state.filters}
                onFilterChange={(newFilters) => this.setState({ filters: newFilters })} 
            />
        );
    }

}

export default Localidades;
