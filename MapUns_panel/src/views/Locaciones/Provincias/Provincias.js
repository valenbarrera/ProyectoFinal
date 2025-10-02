import React, { Component } from 'react';
import axios from "axios";

import api from '../../../api/';

import Create from "./Create.js"
import Edit from "./Edit.js"
import Delete from "./Delete.js"
import Detail from "./Detail.js"

import ParadigmaTable from "../../../components/ParadigmaTable/ParadigmaTable.js"


class Provincias extends Component {
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
                    Header: "Nombre",
                    id: "nombre",
                    accessor: "nombre",
                    show: true,
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
                apiUrl={api.locaciones.provincias.list}
                columns={this.state.columns}
                exportUrl={api.locaciones.provincias.export}
                title={"Provincias"}
                filters={this.state.filters}
                onFilterChange={(newFilters) => this.setState({ filters: newFilters })} 
            />
        );
    }

}

export default Provincias;
