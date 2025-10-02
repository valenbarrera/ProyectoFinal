import React, { Component } from 'react';
import axios from "axios";

import api from '../../api/';
import auth from '../../auth/';

import { Input, Row, Col, FormFeedback, Label, Card, CardHeader, CardBody, CardColumns, CardBlock } from 'reactstrap';
import UnsTable from "../../components/UnsTable/"
import UnsAsyncSeeker from "../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../components/UnsLabeledInput/UnsLabeledInput.js"
import UnsGoogleMap from "../../components/UnsGoogleMap/UnsGoogleMap.js"
import FiltersDropdown from "../../components/FiltersMap/FiltersDropdown.js"
import RankingModal from "../../components/FiltersMap/RankingModal.js";


import { withScriptjs, withGoogleMap, GoogleMap, Marker, DirectionsRenderer } from "react-google-maps"

import Detail from '../Clientes/Detail.js'

import ReactStreetview from 'react-streetview';


class Mapa extends Component {
    constructor() {
        super();
        this.state = {
            provincia_id: null,
            direcciones: [],
            center: null,
            siempreclientes: true,
            incluirDebaja: false,
            rankingOpen: false,
            tempVendedor: [],
            tempTransporte: [],
            tempFechaDesde: null,
            tempFechaHasta: null,
            tempDeposito: null,
            tempLineaProducto: null,
            tempActividad: null,
            deposito: null,
            lineaProducto: null,
            actividad: null,
        };
    }

    GetDirecciones(provincia_id, localidad_id, siempreclientes) {
        var self = this;

        // construyo array de params válidos
        let params = [];

        if (provincia_id) params.push("provincia_id=" + provincia_id);
        if (localidad_id) params.push("localidad_id=" + localidad_id);

        params.push("incluir_debaja=" + this.state.incluirDebaja);

        if (siempreclientes) params.push("siempreclientes=" + siempreclientes);

        if (this.state.vendedor && this.state.vendedor !== "todos") {
            params.push("vendedor_id=" + this.state.vendedor.join(","));
        }
        if (this.state.transporte && this.state.transporte !== "todos") {
            params.push("transporte_id=" + this.state.transporte.join(","));
        }
        if (this.state.deposito && this.state.deposito !== "todos") {
            params.push("deposito_id=" + this.state.deposito.join(","));
        }
        if (this.state.lineaProducto && this.state.lineaProducto !== "todos") {
            params.push("linea_id=" + this.state.lineaProducto);
        }
        if (this.state.fechaDesde && this.state.fechaDesde !== "todos") {
            params.push("fecha_desde=" + this.state.fechaDesde);
        }
        if (this.state.fechaHasta && this.state.fechaHasta !== "todos") {
            params.push("fecha_hasta=" + this.state.fechaHasta);
        }
        if (this.state.actividad && this.state.actividad !== "todos") {
            params.push("actividad=" + this.state.actividad);
        }
        // armar url final
        var url = api.clientes.maplist + "?" + params.join("&");

        axios.get(url, auth.header())
            .then(function (response) {
            self.setState({
                direcciones: response.data.rows,
                center: response.data.center
            });
         });
    }


    componentDidMount() {
        this.GetDirecciones(this.state.provincia_id, this.state.localidad_id, this.state.siempreclientes);
    }

    onChangeProvincia(data) {
        if (data) {
            this.GetDirecciones(data.pk, null, this.state.siempreclientes);
            this.setState({ provincia_id: data.pk });
        }
        else {
            this.GetDirecciones(null, null, this.state.siempreclientes);
            this.setState({ provincia_id: null });
            this.onChangeLocalidad(null);
        }
    }
    onChangeLocalidad(data) {
        if (data) {
            this.GetDirecciones(this.state.provincia_id, data.pk, this.state.siempreclientes);
            this.setState({ localidad_id: data.pk });
        }
        else {
            this.GetDirecciones(this.state.provincia_id, null, this.state.siempreclientes);
            this.setState({ localidad_id: null });
        }
    }

    onChangeIncluirDebaja(incluirDebaja) {
        this.setState({ incluirDebaja }, () => {
            this.GetDirecciones(
                this.state.provincia_id,
                this.state.localidad_id,
                this.state.siempreclientes
            );
        });
    }

    onChangeSiempreClientes(siempreclientes) {
        this.GetDirecciones(this.state.provincia_id, this.state.localidad_id, siempreclientes);
        this.setState({ siempreclientes: siempreclientes });
    }

    // Método para aplicar los filtros
    applyFilters = () => {
        this.setState({
            vendedor: this.state.tempVendedor,
            transporte: this.state.tempTransporte,
            fechaDesde: this.state.tempFechaDesde,
            fechaHasta: this.state.tempFechaHasta,
            deposito: this.state.tempDeposito,
            lineaProducto: this.state.tempLineaProducto,
            actividad: this.state.tempActividad,
            filtrosOpen: false,
        }, () => {
            this.GetDirecciones(
            this.state.provincia_id,
            this.state.localidad_id,
            this.state.siempreclientes
            );
        });
    };


    // Método para abrir el sidebar y sincronizar los estados
    openFiltersDropdown = () => {
        this.setState({
            modalFiltrosOpen: true,
            tempVendedor: this.state.vendedor,
            tempTransporte: this.state.transporte,
            tempFechaDesde: this.state.fechaDesde,
            tempFechaHasta: this.state.fechaHasta,
        });
    };

    // Método para cerrar el sidebar
    closeFiltersDropdown = () => {
        this.setState({
            modalFiltrosOpen: false,
        });
    };

    clearAllFilters = () => {
        this.setState({
            tempVendedor: [],
            tempTransporte: [],
            tempFechaHasta: null,
            tempDeposito: [],
            tempLineaProducto: [],
            tempActividad: "todos",
            vendedor: [],
            transporte: [],
            fechaDesde: null,
            fechaHasta: null,
            deposito: [],
            lineaProducto: [],
            actividad: "todos",
            tempFechaDesde: null,
        }, () => {
            this.GetDirecciones(this.state.provincia_id, this.state.localidad_id, this.state.siempreclientes);
        });
    };

    render() {
        const { data, pages, loading } = this.state;
        var markers = this.state.direcciones.map(x => ({
            isOpen: false,
            position: { lat: parseFloat(x.latitud), lng: parseFloat(x.longitud) },
            domicilio: x.domicilio,
            nombre: x.nombre,
            telefono: x.telefono,
            puesto: x.puesto,
            weight: x.weight,
            pk: x.pk
        }));
        for (let i = 0; i < markers.length; i++) {
            let mk = markers[i];
            let Component = () => (<div style={{ minWidth: '350px', maxWidth: '500px', minHeight: '40px' }}>
                <div className="col-12 pr-0">
                    <Label className=" d-inline-block"> <h2>{mk.nombre}</h2></Label>
                </div>
                <div className="col-12 pr-0"><Label className=" d-inline-block"> <h2>{mk.domicilio}</h2></Label></div>
                <div className="col-12 pr-0"><Label className="d-inline-block">  <h6>Ranking: {mk.puesto}</h6></Label></div>
                <div className="col-12 pr-0">
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#eeeeee' }}>
                        <ReactStreetview
                            apiKey={"AIzaSyAsT1m6bBdumM-VbrP6kFWbtErVLpPgXQ8"}
                            streetViewPanoramaOptions={{
                                position: { lat: mk.position.lat, lng: mk.position.lng },
                                pov: { heading: 100, pitch: 0 },
                                zoom: 1
                            }}
                        />
                    </div>
                </div>
            </div>);
            mk.Component = Component;
        }
        return (
            <div>
                <Row className="">
                    <div className="col-5 col-md-3">
                        <UnsLabeledInput label={<span style={{ color: 'white' }}>Provincia</span>} labelColumns={3} fieldColumns={9} InputComponent={<UnsAsyncSeeker onChange={(data) => this.onChangeProvincia(data)} fieldName={""} url={api.locaciones.provincias.select + "?incluir_debaja=" + this.state.incluirDebaja}
                            nombreField={"nombre"} value={this.state.provincia_id} />} />
                    </div>
                    <div className="col-5 col-md-3">
                        <UnsLabeledInput label={<span style={{ color: 'white' }}>Localidad</span>} labelColumns={3} fieldColumns={9} InputComponent={<UnsAsyncSeeker onChange={(data) => this.onChangeLocalidad(data)}
                            disabled={!this.state.provincia_id}
                            fieldName={""} url={api.locaciones.localidades.select + "?provincia_id=" + this.state.provincia_id + "&incluir_debaja=" + this.state.incluirDebaja}
                            nombreField={"nombre"} value={this.state.localidad_id} />} />
                    </div>
                    <div className="col-2 col-md-2">
                        <Label style={{ color: 'white' }}><Input type="checkbox" onClick={(e) => this.onChangeSiempreClientes(!this.state.siempreclientes)} checked={this.state.siempreclientes} />Siempre mostrar Clientes</Label>
                    </div>
                    <div className="col-2 col-md-2">
                        <Label style={{ color: 'white' }}>
                            <Input
                            type="checkbox"
                            onChange={(e) => this.onChangeIncluirDebaja(e.target.checked)}
                            checked={this.state.incluirDebaja}
                            />
                            Incluir clientes dados de baja
                        </Label>
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={() => this.setState({ modalFiltrosOpen: !this.state.modalFiltrosOpen })}>Filtros</button>
                    </div>
                    <div>
                        <button
                            className="btn btn-success ml-2"
                            onClick={() => this.setState({ rankingOpen: !this.state.rankingOpen })}
                        >
                            Ranking
                        </button>
                    </div>
                    <RankingModal
                        isOpen={this.state.rankingOpen}
                        toggle={() => this.setState({ rankingOpen: false })}
                        clientes={this.state.direcciones}
                    />
                </Row>
                <FiltersDropdown
                    isOpen={this.state.modalFiltrosOpen}
                    onApply={this.applyFilters}
                    onCancel={() => this.setState({ modalFiltrosOpen: false })}
                    onClearAll={this.clearAllFilters}
                    vendedor={this.state.tempVendedor}
                    transporte={this.state.tempTransporte}
                    fechaDesde={this.state.tempFechaDesde}
                    fechaHasta={this.state.tempFechaHasta}
                    deposito={this.state.tempDeposito}
                    lineaProducto={this.state.tempLineaProducto}
                    actividad={this.state.tempActividad}
                    onVendedorChange={(data) => this.setState({ tempVendedor: data === "todos"
                        ? "todos"
                        : (Array.isArray(data) ? data.map(d => d.pk) : (data ? [data.pk] : [])) })}
                    onTransporteChange={(data) => this.setState({ tempTransporte: data === "todos"
                        ? "todos"
                        : (Array.isArray(data) ? data.map(d => d.pk) : (data ? [data.pk] : [])) })}
                    onDepositoChange={(data) => this.setState({ tempDeposito: data === "todos"
                        ? "todos"
                        : (Array.isArray(data) ? data.map(d => d.pk) : (data ? [data.pk] : [])) })}
                    onLineaProductoChange={(data) => this.setState({ tempLineaProducto: data === "todos"
                        ? "todos"
                        : (Array.isArray(data) ? data.map(d => d.pk) : (data ? [data.pk] : [])) })}
                    onActividadChange={(e) => this.setState({ tempActividad: e.target.value })}
                    onFechaDesdeChange={(e) => this.setState({ tempFechaDesde: e.target.value })}
                    onFechaHastaChange={(e) => this.setState({ tempFechaHasta: e.target.value })}
                />

                <Row className="mt-1">
                    <UnsGoogleMap center={this.state.center} markers={markers} />
                </Row>
            </div>
        );
    }

}

export default Mapa;