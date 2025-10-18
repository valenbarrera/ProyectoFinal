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
                    Cell: (cell) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const pk = cell && cell.original ? cell.original.pk : null;
                                    if (pk) window.location.hash = `#/alumnos/${pk}`;
                                }}
                                title="Ver detalle"
                                style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    lineHeight: '16px',
                                    textAlign: 'center',
                                    borderRadius: 8,
                                    background: '#2b4464',
                                    color: '#fff',
                                    fontSize: 10,
                                    marginRight: 6,
                                    cursor: 'pointer',
                                }}
                            >
                                +
                            </span>
                            <span>{cell.value}</span>
                        </div>
                    ),
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
                buttons={[]}
                onRowDoubleClick={(row) => {
                    if (row && row.pk) {
                        if (this.props && this.props.history && this.props.history.push) {
                            this.props.history.push(`/alumnos/${row.pk}`);
                        } else {
                            window.location.hash = `#/alumnos/${row.pk}`;
                        }
                    }
                }}
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
