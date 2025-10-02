import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";
import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput/UnsLabeledInput.js"


import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';


class Unlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pk: 0,
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            pk: 0,
        });
    }

    setSelects(data) {
        this.setState({
        });
    }

    render() {
        return (
            <UnsModal
                getUrl={api.usuarios.usuarios.unlock}
                postUrl={api.usuarios.usuarios.unlock}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Usuario ha sido habilitado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Habilitar login de Usuario"}
                buttonTitle={"Habilitar"}
                buttonIcon={"fa fa-unlock fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                buttonClass={"btn-warning"} 
                saveButtonLabel={"Habilitar"}
                warning={true}
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

export default Unlock;
