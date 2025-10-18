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
    <Col md={6} className="mb-2">
      <strong>{label}:</strong> <span>{(value !== null && value !== undefined && value !== '') ? String(value) : '-'}</span>
    </Col>
  );

  render() {
    const { loading, data } = this.state;
    const Field = this.Field;
    if (loading) return <div className="p-3">Cargando...</div>;
    if (!data) return <div className="p-3">No se encontró el alumno.</div>;

    return (
      <div className="p-2">
        <div className="mb-2"><Link to="/alumnos" className="btn btn-light">← Volver</Link></div>

        <Card className="mb-3">
          <CardHeader>Datos personales</CardHeader>
          <CardBody>
            <Row>
              <Field label="Nombre" value={data.nombre} />
              <Field label="Apellido" value={data.apellido} />
              <Field label="Género" value={data.genero} />
              <Field label="País doc." value={data.pais_documento} />
              <Field label="Tipo doc." value={data.tipo_documento} />
              <Field label="Nro documento" value={data.nro_documento} />
              <Field label="Nacionalidad" value={data.nacionalidad} />
              <Field label="CUIL" value={data.cuil} />
              <Field label="Pueblos originarios" value={data.pueblos_originarios} />
              <Field label="Obra social" value={data.obra_social} />
              <Field label="Teléfono" value={data.telefono} />
              <Field label="Email" value={data.email} />
              <Field label="Regular" value={data.esRegular ? 'Sí' : 'No'} />
              <Field label="Carrera" value={data.carrera} />
              <Field label="Fecha inscripción" value={data.fecha_inscripcion} />
            </Row>
          </CardBody>
        </Card>

        <Card className="mb-3">
          <CardHeader>Domicilios</CardHeader>
          <CardBody>
            <Row>
              <Field label="Calle (procedencia)" value={data.calle_procedencia} />
              <Field label="Nro (procedencia)" value={data.nro_procedencia} />
              <Field label="Localidad (procedencia)" value={data.localidad_procedencia} />
              <Field label="Provincia (procedencia)" value={data.provincia_procedencia} />
              <Field label="Calle (estudio)" value={data.calle_estudio} />
              <Field label="Nro (estudio)" value={data.nro_estudio} />
              <Field label="Localidad (estudio)" value={data.localidad_estudio} />
              <Field label="Provincia (estudio)" value={data.provincia_estudio} />
            </Row>
          </CardBody>
        </Card>

        <Card className="mb-3">
          <CardHeader>Datos familiares</CardHeader>
          <CardBody>
            <Row>
              <Field label="Estado civil" value={data.estado_civil} />
              <Field label="Cant. hijos" value={data.cant_hijos} />
              <Field label="Nombre padre" value={data.nombre_padre} />
              <Field label="Apellido padre" value={data.apellido_padre} />
              <Field label="Vive padre" value={data.vive_padre ? 'Sí' : 'No'} />
              <Field label="Nivel estudio padre" value={data.nivel_estudio_padre} />
              <Field label="Nombre madre" value={data.nombre_madre} />
              <Field label="Apellido madre" value={data.apellido_madre} />
              <Field label="Vive madre" value={data.vive_madre ? 'Sí' : 'No'} />
              <Field label="Nivel estudio madre" value={data.nivel_estudio_madre} />
            </Row>
          </CardBody>
        </Card>

        <Card className="mb-3">
          <CardHeader>Datos ocupacionales</CardHeader>
          <CardBody>
            <Row>
              <Field label="Colegio secundario" value={data.colegio_secundario} />
              <Field label="Año egreso secundario" value={data.anio_egreso_secundario} />
              <Field label="Condición laboral" value={data.condicion_laboral} />
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default AlumnoDetail;

