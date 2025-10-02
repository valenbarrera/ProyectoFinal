import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"

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
            <ParadigmaModal
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
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Apellido"} fieldName={"last_name"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"first_name"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Usuario"} fieldName={"username"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Email"} fieldName={"email"} />
            </ParadigmaModal>
        );
    }
}

export default Lock;
