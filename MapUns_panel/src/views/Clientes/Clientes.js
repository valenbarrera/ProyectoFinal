import React, { Component } from 'react';
import axios from "axios";

import api from '../../api/';

import Detail from "./Detail.js"

import UnsTable from "../../components/UnsTable/UnsTable.js"


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
                    Header: <div style={{ textAlign: 'center' }}>Apellido</div>,
                    id: "apellido",
                    accessor: "apellido",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Domicilio de Procedencia</div>,
                    id: "domicilio",
                    accessor: "domicilio",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Localidad</div>,
                    id: "localidad_nombre",
                    accessor: "localidad_nombre",
                    show: true,
                    getProps: () => ({ style: { textAlign: 'center' } }),
                },
                {
                    Header: <div style={{ textAlign: 'center' }}>Provincia</div>,
                    id: "provincia_nombre",
                    accessor: "provincia_nombre",
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
            <UnsTable
                buttons={[
                    {
                        detail: true,
                        component: Detail,
                        permission: 'ejemplo_detail',
                    },
                ]}
                apiUrl={api.alumnos.list}
                columns={this.state.columns}
                exportUrl={api.alumnos.export}
                title={"Alumnos"}
                filters={this.state.filters}
                onFilterChange={(newFilters) => this.setState({ filters: newFilters })} 
            />
        );
    }

}

export default Ejemplo;
