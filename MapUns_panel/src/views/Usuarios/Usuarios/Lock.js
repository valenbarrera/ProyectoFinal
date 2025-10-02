import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput/UnsLabeledInput.js"

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

class Lock extends Component {
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

    }

    setSelects(data) {
    }

    render() {
        return (
            <UnsModal
                getUrl={api.usuarios.usuarios.lock}
                postUrl={api.usuarios.usuarios.lock}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Usuario ha sido deshabilitado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Deshabilitar login de Usuario"}
                buttonTitle={"Deshabilitar"}
                buttonIcon={"fa fa-lock fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButtonLabel={"Deshabilitar"}
                buttonClass={"btn-warning"} 
                warning={true}
                saveButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
                closeButton={true}>
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Apellido"} fieldName={"last_name"} />
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"first_name"} />
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Usuario"} fieldName={"username"} />
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Email"} fieldName={"email"} />
            </UnsModal>
        );
    }
}

export default Lock;
