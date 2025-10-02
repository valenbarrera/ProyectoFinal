import React from 'react';
import { Button, Label, Row, Col, Input, Collapse, Card, CardBody } from 'reactstrap';
import UnsAsyncSeeker from "../UnsAsyncSeeker/UnsAsyncSeeker.js";
import api from "../../api/";

const FiltersDropdown = ({
  isOpen,
  onApply,
  onCancel,
  vendedor,
  transporte,
  fechaDesde,
  fechaHasta,
  deposito,
  lineaProducto,
  actividad,
  onVendedorChange,
  onTransporteChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onDepositoChange,
  onLineaProductoChange,
  onActividadChange,
  onClearAll
}) => {
  return (
    <Collapse isOpen={isOpen}>
      <Card className="mt-2">
        <CardBody>
          <Row>
            {/* Vendedor */}
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Vendedor</Label>
              <div>
                <UnsAsyncSeeker
                  onChange={onVendedorChange}
                  fieldName={"codigo_vendedor"}
                  url={api.vendedores.select}
                  nombreField={"nombre"}
                  value={vendedor === "todos" ? [] : vendedor}
                  multiselect={true}
                  disabled={vendedor === "todos"}
                />
                {/*}
                <Label style={{ color: 'white' }} check className="ml-2">
                  <Input
                    type="checkbox"
                    checked={vendedor === "todos"}
                    onChange={(e) => onVendedorChange(e.target.checked ? "todos" : null)}
                  />{" "}
                  Todos
                </Label>
                */}
              </div>
            </Col>

            {/* Transporte */}
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Transporte</Label>
              <div>
                <UnsAsyncSeeker
                  onChange={onTransporteChange}
                  fieldName={"codigo_transporte"}
                  url={api.transportes.select}
                  nombreField={"nombre"}
                  value={transporte === "todos" ? [] : transporte}
                  multiselect={true}
                  disabled={transporte === "todos"}
                />
                {/*
                <Label style={{ color: 'white' }} check className="ml-2">
                  <Input
                    type="checkbox"
                    checked={transporte === "todos"}
                    onChange={(e) => onTransporteChange(e.target.checked ? "todos" : null)}
                  />{" "}
                  Todos
                </Label>
                */}
              </div>
            </Col>

            {/* Depósito */}
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Depósito</Label>
              <div>
                <UnsAsyncSeeker
                  onChange={onDepositoChange}
                  fieldName={"deposito_id"}
                  url={api.depositos.select}
                  nombreField={"nombre"}
                  value={deposito === "todos" ? [] : deposito}
                  multiselect={true}
                  disabled={deposito === "todos"}
                />
                {/*}
                <Label style={{ color: 'white' }} check className="ml-2">
                  <Input
                    type="checkbox"
                    checked={deposito === "todos"}
                    onChange={(e) => onDepositoChange(e.target.checked ? "todos" : null)}
                  />{" "}
                  Todos
                </Label>
                */}
              </div>
            </Col>

            {/* Actividad */}
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Actividad</Label>
              <Input
                type="select"
                value={actividad || "todos"}
                onChange={onActividadChange}
              >
                <option value="todos">Todos</option>
                <option value="con_actividad">Con Actividad</option>
                <option value="sin_actividad">Sin Actividad</option>
              </Input>
            </Col>

            {/* Fechas */}
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Desde</Label>
              <Input
                type="date"
                value={fechaDesde && fechaDesde !== "todos" ? fechaDesde : ""}
                onChange={onFechaDesdeChange}
                disabled={fechaDesde === "todos"}
              />
            </Col>
            <Col md={2} className="mb-3">
              <Label style={{ color: 'white' }}>Hasta</Label>
              <Input
                type="date"
                value={fechaHasta && fechaHasta !== "todos" ? fechaHasta : ""}
                onChange={onFechaHastaChange}
                disabled={fechaHasta === "todos"}
              />
              {/*}
              <Label style={{ color: 'white' }} check className="mt-2 d-block">
                <Input
                  type="checkbox"
                  checked={fechaDesde === "todos" && fechaHasta === "todos"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onFechaDesdeChange({ target: { value: "todos" } });
                      onFechaHastaChange({ target: { value: "todos" } });
                    } else {
                      onFechaDesdeChange({ target: { value: null } });
                      onFechaHastaChange({ target: { value: null } });
                    }
                  }}
                />{" "}
                Todas
              </Label>*/}
            </Col>
          </Row>
          
          {/*
          <Row>
            

             Línea de Producto
            
            <Col md={4} className="mb-3">
              <Label style={{ color: 'white' }}>Línea de Producto</Label>
              <div>
                <UnsAsyncSeeker
                  onChange={onLineaProductoChange}
                  fieldName={"linea_id"}
                  url={api.lineasProductos.select}
                  nombreField={"nombre"}
                  value={lineaProducto === "todos" ? [] : lineaProducto}
                  multiselect={true}
                  disabled={lineaProducto === "todos"}
                />
                <Label style={{ color: 'white' }} check className="ml-2">
                  <Input
                    type="checkbox"
                    checked={lineaProducto === "todos"}
                    onChange={(e) => onVendedorChange(e.target.checked ? "todos" : null)}
                  />{" "}
                  Todos
                </Label>
              </div>
            </Col>
             
          </Row>

          */}
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
