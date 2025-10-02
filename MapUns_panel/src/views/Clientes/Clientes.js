import React, { Component } from 'react';
import axios from "axios";

import api from '../../api/';

import Detail from "./Detail.js"

import ParadigmaTable from "../../components/ParadigmaTable/ParadigmaTable.js"


class Ejemplo extends Component {
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
                    Header: <div style={{ textAlign: 'center' }}>Email</div>,
                    id: "email",
                    accessor: "email",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Domicilio</div>,
                    id: "domicilio",
                    accessor: "domicilio",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Localidad</div>,
                    id: "localidad__nombre",
                    accessor: "localidad__nombre",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Provincia</div>,
                    id: "localidad__provincia__nombre",
                    accessor: "localidad__provincia__nombre",
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
                        detail: true,
                        component: Detail,
                        permission: 'ejemplo_detail',
                    },
                ]}
                apiUrl={api.clientes.list}
                columns={this.state.columns}
                exportUrl={api.clientes.export}
                title={"Clientes"}
                filters={this.state.filters}
                onFilterChange={(newFilters) => this.setState({ filters: newFilters })} 
            />
        );
    }

}

export default Ejemplo;
