import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput"

class Delete extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
        });
    }

    setSelects(data) {
    }

    render() {
        return (
            <ParadigmaModal
                getUrl={api.locaciones.provincias.delete}
                postUrl={api.locaciones.provincias.delete}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"La Provincia ha sido eliminado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Eliminar Provincia"}
                buttonTitle={"Eliminar"}
                buttonIcon={"fa fa-trash fa-lg"}
                saveButton={true}
                buttonClass={"btn-danger"} 
                closeButton={true}
                danger={true}
                saveButtonLabel={"Eliminar"}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput disabled={true} label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />

            </ParadigmaModal>
        );
    }
}

export default Delete;
