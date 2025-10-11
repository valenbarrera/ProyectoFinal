import React, { Component } from 'react';
import axios from "axios";

import api from '../../api/';
import auth from '../../auth/';

import { Input, Row, Col, FormFeedback, Label, Card, CardHeader, CardBody, CardColumns, CardBlock } from 'reactstrap';
import UnsTable from "../../components/UnsTable/"
import UnsAsyncSeeker from "../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../components/UnsLabeledInput/UnsLabeledInput.js"
import FiltersDropdown from "../../components/FiltersMap/FiltersDropdown.js"
import RankingModal from "../../components/FiltersMap/RankingModal.js";
import UnsLeafletMap from "../../components/UnsGoogleMap/UnsLeafletmap.js";


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
            tempCarrera: [],
            tempFechaDesde: null,
            tempFechaHasta: null,
            tempRegular: null,
            regular: null,
            carrera: null,
            tempActividad: null,
        };
    }

    GetDirecciones(provincia_id, localidad_id) {
        var self = this;

        // construyo array de params válidos
        let params = [];

        if (provincia_id) params.push("provincia_id=" + provincia_id);
        if (localidad_id) params.push("localidad_id=" + localidad_id);

        if (this.state.carrera && this.state.carrera !== "todos") {
            params.push("carrera=" + this.state.carrera.join(","));
        }
        if (this.state.fechaDesde && this.state.fechaDesde !== "todos") {
            params.push("fecha_desde=" + this.state.fechaDesde);
        }
        if (this.state.fechaHasta && this.state.fechaHasta !== "todos") {
            params.push("fecha_hasta=" + this.state.fechaHasta);
        }
        if (this.state.regular && this.state.regular !== "todos") {
            params.push("regularidad=" + this.state.regular);
        }
        // armar url final
        var url = api.alumnos.maplist + "?" + params.join("&");

        axios.get(url, auth.header())
            .then(function (response) {
            self.setState({
                direcciones: response.data.rows,
                center: response.data.center
            });
         });
    }


    componentDidMount() {
        this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
    }

    onChangeProvincia(data) {
        if (data) {
            this.GetDirecciones(data.pk, null);
            this.setState({ provincia_id: data.pk });
        }
        else {
            this.GetDirecciones(null, null);
            this.setState({ provincia_id: null });
            this.onChangeLocalidad(null);
        }
    }
    onChangeLocalidad(data) {
        if (data) {
            this.GetDirecciones(this.state.provincia_id, data.pk);
            this.setState({ localidad_id: data.pk });
        }
        else {
            this.GetDirecciones(this.state.provincia_id, null);
            this.setState({ localidad_id: null });
        }
    }

    // Método para aplicar los filtros
    applyFilters = () => {
        this.setState({
            carrera: this.state.tempCarrera,
            fechaDesde: this.state.tempFechaDesde,
            fechaHasta: this.state.tempFechaHasta,
            regular: this.state.tempRegular,
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
            tempCarrera: this.state.vendedor,
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
            tempCarrera: [],
            tempFechaDesde: null,
            tempFechaHasta: null,
            tempRegular: "todos",
            carrera: [],
            fechaDesde: null,
            fechaHasta: null,
            regular: "todos",
        }, () => {
            this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
        });
    };

    render() {
        const { data, pages, loading } = this.state;
        var markers = this.state.direcciones.map(x => ({
            isOpen: false,
            position: { lat: parseFloat(x.latitud), lng: parseFloat(x.longitud) },
            domicilio: x.domicilio,
            nombre: x.nombre,
            carrera: x.carrera,
            telefono: x.telefono,
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
                <div className="col-12 pr-0"><Label className="d-inline-block">  <h6>Carrera: {mk.puesto}</h6></Label></div>
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
                    <div>
                        <button className="btn btn-primary" onClick={() => this.setState({ modalFiltrosOpen: !this.state.modalFiltrosOpen })}>Filtros</button>
                    </div>
                </Row>
                <FiltersDropdown
                    isOpen={this.state.modalFiltrosOpen}
                    onApply={this.applyFilters}
                    onCancel={() => this.setState({ modalFiltrosOpen: false })}
                    onClearAll={this.clearAllFilters}
                    carrera={this.state.tempCarrera}
                    fechaDesde={this.state.tempFechaDesde}
                    fechaHasta={this.state.tempFechaHasta}
                    actividad={this.state.tempActividad}
                    onCarreraChange={(data) => this.setState({ tempCarrera: data === "todos"
                        ? "todos"
                        : (Array.isArray(data) ? data.map(d => d.pk) : (data ? [data.pk] : [])) })}
                    onRegularChange={(e) => this.setState({ tempRegular: e.target.value })}
                    onFechaDesdeChange={(e) => this.setState({ tempFechaDesde: e.target.value })}
                    onFechaHastaChange={(e) => this.setState({ tempFechaHasta: e.target.value })}
                />

                <Row className="mt-1">
                    <UnsLeafletMap center={this.state.center} markers={markers} />
                </Row>
            </div>
        );
    }

}

export default Mapa;