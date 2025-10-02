import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Button,
} from "reactstrap";
import "./RankingModal.scss";

const RankingModal = ({ isOpen, toggle, clientes }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered className="ranking-modal">
      <ModalHeader toggle={toggle}>Ranking de Clientes</ModalHeader>
      <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Posición</th>
              <th style={{ width: "60%" }}>Cliente</th>
              <th style={{ width: "30%" }}>Total Gravado</th>
            </tr>
          </thead>
          <tbody>
            {clientes
              .slice()
              .sort((a, b) => (b.total_gravado || 0) - (a.total_gravado || 0))
              .map((c, idx) => (
                <tr key={c.pk}>
                  <td>{c.puesto || idx + 1}</td>
                  <td>{c.nombre}</td>
                  <td>{("$" + c.total_gravado || 0).toLocaleString("es-AR", {minimumFractionDigits: 2,maximumFractionDigits: 2,})}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RankingModal;
