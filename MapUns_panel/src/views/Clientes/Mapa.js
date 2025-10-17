import React, { Component } from 'react';
import axios from "axios";

import api from '../../api/';
import auth from '../../auth/';

import { Input, Row, Col, FormFeedback, Label, Card, CardHeader, CardBody, CardColumns, CardBlock } from 'reactstrap';
import UnsTable from "../../components/UnsTable/"
import UnsAsyncSeeker from "../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../components/UnsLabeledInput/UnsLabeledInput.js"
import FiltersDropdown from "../../components/FiltersMap/FiltersDropdown.js"
import DisplayToggle from "../../components/FiltersMap/DisplayToggle.js";
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
            ubicacionTipo: 'procedencia',
            carrerasOptions: [],
            tempCarrera: [],
            tempFechaDesde: null,
            tempFechaHasta: null,
            tempRegular: null,
            regular: null,
            carrera: null,
            tempActividad: null,
        };
    }

    handleUbicacionChange = (value) => {
        // Si cambia a estudio, ocultamos/desactivamos provincia/localidad y limpiamos selección
        if (value === 'estudio') {
            this.setState({ ubicacionTipo: value, provincia_id: null, localidad_id: null }, () => {
                this.GetDirecciones(null, null);
            });
        } else {
            this.setState({ ubicacionTipo: value }, () => {
                this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
            });
        }
    }

    GetDirecciones(provincia_id, localidad_id) {
        var self = this;

        // construyo array de params válidos
        let params = [];

        if (provincia_id) params.push("provincia_id=" + provincia_id);
        if (localidad_id) params.push("localidad_id=" + localidad_id);

        if (Array.isArray(this.state.carrera) && this.state.carrera.length > 0) {
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
        // Preparado para futura selección de origen/estudio (backend lo ignorará por ahora)
        if (this.state.ubicacionTipo) {
            params.push("ubicacion=" + this.state.ubicacionTipo);
        }
        // armar url final
        var url = api.alumnos.maplist + "?" + params.join("&");

        axios.get(url, auth.header())
            .then(function (response) {
                const rows = response.data.rows || [];
                if (self._isMounted) {
                    self.setState({
                        direcciones: rows,
                        center: response.data.center,
                    });
                }
            });
    }


    componentDidMount() {
        this._isMounted = true;
        this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
        this.FetchCarrerasOptions();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    FetchCarrerasOptions() {
        const self = this;
        axios.get(api.alumnos.maplist, auth.header())
            .then(function (response) {
                const rows = response.data.rows || [];
                const carreras = Array.from(new Set(rows
                    .map(r => r.carrera)
                    .filter(Boolean)))
                    .sort();
                if (self._isMounted) {
                    self.setState({ carrerasOptions: carreras });
                }
            });
    }

    onChangeProvincia = (data) => {
        const pk = data ? (data.pk !== undefined ? data.pk : (data.id !== undefined ? data.id : (data.value !== undefined ? data.value : null))) : null;
        if (pk) {
            this.setState({ provincia_id: pk, localidad_id: null }, () => {
                this.GetDirecciones(pk, null);
            });
        } else {
            this.setState({ provincia_id: null, localidad_id: null }, () => {
                this.GetDirecciones(null, null);
            });
        }
    }
    onChangeLocalidad = (data) => {
        const pk = data ? (data.pk !== undefined ? data.pk : (data.id !== undefined ? data.id : (data.value !== undefined ? data.value : null))) : null;
        if (pk) {
            this.setState({ localidad_id: pk }, () => {
                this.GetDirecciones(this.state.provincia_id, pk);
            });
        } else {
            this.setState({ localidad_id: null }, () => {
                this.GetDirecciones(this.state.provincia_id, null);
            });
        }
    }

    // Método para aplicar los filtros
    applyFilters = () => {
        const nextCarrera = Array.isArray(this.state.tempCarrera) && this.state.tempCarrera.length > 0
            ? this.state.tempCarrera
            : null;
        const nextRegular = this.state.tempRegular === "todos" ? null : this.state.tempRegular;
        this.setState({
            carrera: nextCarrera,
            fechaDesde: this.state.tempFechaDesde,
            fechaHasta: this.state.tempFechaHasta,
            regular: nextRegular,
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
        const currentRegular = (this.state.regular === null || typeof this.state.regular === 'undefined')
            ? 'todos'
            : String(this.state.regular);
        this.setState({
            modalFiltrosOpen: true,
            tempCarrera: Array.isArray(this.state.carrera) ? this.state.carrera : [],
            tempFechaDesde: this.state.fechaDesde,
            tempFechaHasta: this.state.fechaHasta,
            tempRegular: currentRegular,
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
            carrera: null,
            fechaDesde: null,
            fechaHasta: null,
            regular: "todos",
        }, () => {
            this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
        });
    };

    render() {
        const { data, pages, loading } = this.state;
        var markers = this.state.direcciones
            .filter(x => !isNaN(parseFloat(x.latitud)) && !isNaN(parseFloat(x.longitud)))
            .map(x => ({
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
                {/* Filtros de ubicación: Provincia/Localidad solo para Procedencia; botón Filtros siempre visible */}
                <Row className="">
                    {this.state.ubicacionTipo === 'procedencia' && (
                        <React.Fragment>
                            <div className="col-12 col-md-6 col-lg-4">
                                <UnsLabeledInput label={<span style={{ color: 'white' }}>Provincia</span>} labelColumns={3} fieldColumns={9} InputComponent={<UnsAsyncSeeker key={"prov_" + (this.state.provincia_id || "none")} onChange={(data) => this.onChangeProvincia(data)} fieldName={"provincia_id"} url={api.locaciones.provincias.select}
                                    nombreField={"nombre"} pkField={"id"} value={this.state.provincia_id} narrowToPkOnLoad={false} />} />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <UnsLabeledInput label={<span style={{ color: 'white' }}>Localidad</span>} labelColumns={3} fieldColumns={9} InputComponent={<UnsAsyncSeeker key={"loc_" + (this.state.provincia_id || "none")} onChange={(data) => this.onChangeLocalidad(data)}
                                    disabled={!this.state.provincia_id}
                                    fieldName={"localidad_id"}
                                    url={api.locaciones.localidades.select + (this.state.provincia_id ? ("?provincia_id=" + this.state.provincia_id + "&provincia=" + this.state.provincia_id + "&provincia__id=" + this.state.provincia_id + "&provincia_id__exact=" + this.state.provincia_id) : "")}
                                    nombreField={"nombre"} pkField={"id"} value={this.state.localidad_id} narrowToPkOnLoad={false}
                                    clientFilter={(opt) => String(opt.provincia_id) === String(this.state.provincia_id)} />} />
                            </div>
                        </React.Fragment>
                    )}
                    <div className={this.state.ubicacionTipo === 'procedencia' ? "col-12 col-md-6 col-lg-4 d-flex align-items-end justify-content-md-end mt-2 mt-lg-0" : "col-12 d-flex justify-content-end mt-2"}>
                        <input
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="d-none"
                            ref={el => this.fileInput = el}
                            onChange={async (e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                try {
                                    const form = new FormData();
                                    form.append('file', file);
                                    const resp = await axios.post(api.alumnos.import, form, auth.fileFormHeader());
                                    const data = resp && resp.data ? resp.data : {};
                                    const created = typeof data.created === 'number' ? data.created : 0;
                                    const updated = typeof data.updated === 'number' ? data.updated : 0;
                                    const errors = Array.isArray(data.errors) ? data.errors : [];
                                    this.GetDirecciones(this.state.provincia_id, this.state.localidad_id);
                                    let msg = `Importación completada. Creados: ${created}. Actualizados: ${updated}.`;
                                    if (errors.length > 0) {
                                        const sample = errors.slice(0, 3).map(e => `Fila ${e.row}: ${e.error}`).join("\n");
                                        msg += `\nErrores: ${errors.length}.` + (sample ? `\nEjemplos:\n${sample}` : '');
                                    }
                                    alert(msg);
                                } catch (err) {
                                    const msg = (err && err.response && err.response.data && (err.response.data.error || err.response.data.detail)) || 'Error al importar';
                                    alert(msg);
                                } finally {
                                    e.target.value = '';
                                }
                            }}
                        />
                        <button className="btn btn-success mr-2" onClick={() => this.fileInput && this.fileInput.click()}>
                            Importar alumnos
                        </button>
                        <button className="btn btn-primary" onClick={() => this.setState({ modalFiltrosOpen: !this.state.modalFiltrosOpen })}>Filtros</button>
                    </div>
                </Row>
                <FiltersDropdown
                    isOpen={this.state.modalFiltrosOpen}
                    onApply={this.applyFilters}
                    onCancel={() => this.setState({ modalFiltrosOpen: false })}
                    onClearAll={this.clearAllFilters}
                    carrera={this.state.tempCarrera}
                    regular={this.state.tempRegular}
                    carrerasOptions={this.state.carrerasOptions}
                    fechaDesde={this.state.tempFechaDesde}
                    fechaHasta={this.state.tempFechaHasta}
                    actividad={this.state.tempActividad}
                    onCarreraChange={(e) => {
                        const values = Array.from(e.target.selectedOptions).map(o => o.value);
                        if (values.includes("todos")) {
                            this.setState({ tempCarrera: [] });
                        } else {
                            this.setState({ tempCarrera: values });
                        }
                    }}
                    onRegularChange={(e) => this.setState({ tempRegular: e.target.value })}
                    onFechaDesdeChange={(e) => this.setState({ tempFechaDesde: e.target.value })}
                    onFechaHastaChange={(e) => this.setState({ tempFechaHasta: e.target.value })}
                />

                <Row className="mt-1">
                    <UnsLeafletMap center={this.state.center} markers={markers} />
                </Row>
                <div style={{ position: 'fixed', right: 16, bottom: 56, zIndex: 1000 }}>
                    <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: 8 }}>
                        <DisplayToggle value={this.state.ubicacionTipo} onChange={this.handleUbicacionChange} disableEstudio={true} />
                    </div>
                </div>
            </div>
        );
    }

}

export default Mapa;
