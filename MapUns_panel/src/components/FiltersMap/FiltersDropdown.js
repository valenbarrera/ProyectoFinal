import React from 'react';
import { Button, Label, Row, Col, Input, Collapse, Card, CardBody } from 'reactstrap';

const FiltersDropdown = ({
  isOpen,
  onApply,
  onCancel,
  onClearAll,
  carrera,
  fechaDesde,
  fechaHasta,
  regular,
  onCarreraChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onRegularChange
}) => {
  return (
    <Collapse isOpen={isOpen}>
      <Card className="mt-2">
        <CardBody>
          <Row>
            {/* Carrera */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Carrera</Label>
              <Input
                type="select"
                value={carrera || "todos"}
                onChange={onCarreraChange}
              >
                <option value="todos">Todas</option>
                <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                <option value="Licenciatura en Informática">Licenciatura en Informática</option>
                <option value="Tecnicatura Universitaria en Programación">Tecnicatura Universitaria en Programación</option>
              </Input>
            </Col>

            {/* Regularidad */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Regularidad</Label>
              <Input
                type="select"
                value={regular || "todos"}
                onChange={onRegularChange}
              >
                <option value="todos">Todas</option>
                <option value="true">Regulares</option>
                <option value="false">No regulares</option>
              </Input>
            </Col>

            {/* Fecha desde */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Fecha desde</Label>
              <Input
                type="date"
                value={fechaDesde || ""}
                onChange={onFechaDesdeChange}
              />
            </Col>

            {/* Fecha hasta */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Fecha hasta</Label>
              <Input
                type="date"
                value={fechaHasta || ""}
                onChange={onFechaHastaChange}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Button color="primary" onClick={onApply}>Aplicar</Button>
              <Button color="secondary" onClick={onCancel} className="ml-2">Cancelar</Button>
              <Button color="danger" onClick={onClearAll} className="ml-2">Borrar todos</Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Collapse>
  );
};

export default FiltersDropdown;
