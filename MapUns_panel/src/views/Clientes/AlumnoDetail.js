import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/';
import auth from '../../auth/';

class AlumnoDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
    };
  }

  componentDidMount() {
    const id = (this.props.match && this.props.match.params && this.props.match.params.id) ? this.props.match.params.id : null;
    if (!id) {
      this.setState({ loading: false, data: null });
      return;
    }
    axios.get(api.alumnos.detail + id + '/', auth.header())
      .then(res => this.setState({ loading: false, data: res.data }))
      .catch(() => this.setState({ loading: false, data: null }));
  }

  Field = ({ label, value }) => (
    <Col md={6} className="mb-2 text-white">
      <strong>{label}:</strong> <span>{(value !== null && value !== undefined && value !== '') ? String(value) : '-'}</span>
    </Col>
  );

  render() {
    const { loading, data } = this.state;
    const Field = this.Field;
    if (loading) return <div className="p-3">Cargando...</div>;
    if (!data) return <div className="p-3">No se encontró el alumno.</div>;

    const from = (this.props && this.props.location && this.props.location.state && this.props.location.state.from) || null;
    const backPath = from === 'mapa' ? '/mapa' : '/alumnos';

    return (
      <div className="p-2">
        <div className="mb-2"><Link to={backPath} className="btn btn-light">← Volver</Link></div>

        <Card className="mb-3">
          <CardHeader>Datos personales</CardHeader>
          <CardBody>
            <Row>
              <Field label="Nombre" value={data.nombre} />
              <Field label="Apellido" value={data.apellido} />
              <Field label="Género" value={data.genero} />
              <Field label="País emisor del documento" value={data.pais_documento} />
              <Field label="Tipo de documento" value={data.tipo_documento} />
              <Field label="Número de documento" value={data.nro_documento} />
              <Field label="Nacionalidad" value={data.nacionalidad} />
              <Field label="Número de CUIL" value={data.cuil} />
              <Field label="Pertenece a Pueblos Originarios" value={data.pueblos_originarios} />
              <Field label="Cobertura de Salud" value={data.obra_social} />
              <Field label="Teléfono" value={data.telefono} />
              <Field label="Email" value={data.email} />
              <Field label="Carrera" value={data.carrera} />
              <Field label="Fecha inscripción" value={data.fecha_inscripcion} />
            </Row>
          </CardBody>
        </Card>

      <Card className="mb-3">
        <CardHeader>Domicilios</CardHeader>
        <CardBody>
          <Row>
            <Col md={12} className="text-white mb-2"><strong>Domicilio de procedencia</strong></Col>
            <Field label="Calle" value={data.calle_procedencia} />
            <Field label="Número" value={data.nro_procedencia} />
            <Field label="Localidad" value={data.localidad_procedencia} />
            <Field label="Provincia" value={data.provincia_procedencia} />
            <Col md={12}><hr className="border-secondary"/></Col>
            <Col md={12} className="text-white mb-2"><strong>Domicilio durante el período de clases</strong></Col>
            <Field label="Calle" value={data.calle_estudio} />
            <Field label="Número" value={data.nro_estudio} />
            <Field label="Localidad" value={data.localidad_estudio} />
            <Field label="Provincia" value={data.provincia_estudio} />
          </Row>
        </CardBody>
      </Card>

      <Card className="mb-3">
        <CardHeader>Datos familiares</CardHeader>
        <CardBody>
          <Row>
            <Field label="Estado civil" value={data.estado_civil} />
            <Field label="Cantidad de hijos" value={data.cant_hijos} />
            <Col md={12}><hr className="border-secondary"/></Col>
            <Col md={12} className="text-white mb-2"><strong>Datos del padre</strong></Col>
            <Field label="Nombre" value={data.nombre_padre} />
            <Field label="Apellido" value={data.apellido_padre} />
            <Field label="Vive" value={data.vive_padre ? 'Sí' : 'No'} />
            <Field label="Máximo nivel de estudios cursados" value={data.nivel_estudio_padre} />
            <Col md={12}><hr className="border-secondary"/></Col>
            <Col md={12} className="text-white mb-2"><strong>Datos de la madre</strong></Col>
            <Field label="Nombre" value={data.nombre_madre} />
            <Field label="Apellido" value={data.apellido_madre} />
            <Field label="Vive" value={data.vive_madre ? 'Sí' : 'No'} />
            <Field label="Máximo nivel de estudios cursados" value={data.nivel_estudio_madre} />
          </Row>
        </CardBody>
      </Card>

        <Card className="mb-3">
          <CardHeader>Datos ocupacionales</CardHeader>
          <CardBody>
            <Row>
              <Field label="Colegio secundario" value={data.colegio_secundario} />
              <Field label="Año de egreso secundario" value={data.anio_egreso_secundario} />
              <Field label="Condición laboral" value={data.condicion_laboral} />
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default AlumnoDetail;
