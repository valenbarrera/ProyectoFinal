import React from 'react';
import { Button, Label, Row, Col, Input, Collapse, Card, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const FiltersDropdown = ({
  isOpen,
  onApply,
  onCancel,
  onClearAll,
  carrera,
  carrerasOptions = [],
  fechaDesde,
  fechaHasta,
  regular,
  onCarreraChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onRegularChange
}) => {
  const [carreraOpen, setCarreraOpen] = React.useState(false);
  const [regularOpen, setRegularOpen] = React.useState(false);
  const selectedCarreras = Array.isArray(carrera) ? carrera : [];
  const selected = selectedCarreras.length > 0 ? selectedCarreras[0] : null;
  const summary = selected ? selected : 'Todas';
  const regularValue = typeof regular === 'boolean' ? (regular ? 'true' : 'false') : (regular || 'todos');
  const regularSummary = regularValue === 'todos'
    ? 'Todas'
    : (regularValue === 'true' ? 'Regulares' : 'No regulares');

  const emitCarreraChange = (values) => {
    if (onCarreraChange) {
      const eventLike = { target: { selectedOptions: values.map(v => ({ value: v })) } };
      onCarreraChange(eventLike);
    }
  };

  const chooseTodas = () => {
    emitCarreraChange([]);
    setCarreraOpen(false);
  };

  const chooseCarrera = (value) => {
    emitCarreraChange([value]);
    setCarreraOpen(false);
  };

  return (
    <Collapse isOpen={isOpen}>
      <Card className="mt-2">
        <CardBody>
          <Row>
            {/* Carrera */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Carrera</Label>
              <Dropdown isOpen={carreraOpen} toggle={() => setCarreraOpen(!carreraOpen)}>
                <DropdownToggle caret color="light" className="w-100 text-left">
                  {summary}
                </DropdownToggle>
                <DropdownMenu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <DropdownItem toggle={false} active={!selected} onClick={chooseTodas}>
                    Todas
                  </DropdownItem>
                  {Array.isArray(carrerasOptions) && carrerasOptions.length > 0 ? (
                    carrerasOptions.map((c) => (
                      <DropdownItem key={c} toggle={false} active={selected === c} onClick={() => chooseCarrera(c)}>
                        {c}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem disabled>Cargando...</DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </Col>

            {/* Regularidad */}
            <Col md={3} className="mb-3">
              <Label style={{ color: 'white' }}>Regularidad</Label>
              <Dropdown isOpen={regularOpen} toggle={() => setRegularOpen(!regularOpen)}>
                <DropdownToggle caret color="light" className="w-100 text-left">
                  {regularSummary}
                </DropdownToggle>
                <DropdownMenu className="w-100">
                  <DropdownItem
                    toggle={false}
                    active={regularValue === 'todos'}
                    onClick={() => { onRegularChange && onRegularChange({ target: { value: 'todos' } }); setRegularOpen(false); }}
                  >
                    Todas
                  </DropdownItem>
                  <DropdownItem
                    toggle={false}
                    active={regularValue === 'true'}
                    onClick={() => { onRegularChange && onRegularChange({ target: { value: 'true' } }); setRegularOpen(false); }}
                  >
                    Regulares
                  </DropdownItem>
                  <DropdownItem
                    toggle={false}
                    active={regularValue === 'false'}
                    onClick={() => { onRegularChange && onRegularChange({ target: { value: 'false' } }); setRegularOpen(false); }}
                  >
                    No regulares
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
