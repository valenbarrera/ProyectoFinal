import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";
import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"


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
            <ParadigmaModal
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
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Apellido"} fieldName={"last_name"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"first_name"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Usuario"} fieldName={"username"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Email"} fieldName={"email"} />
            </ParadigmaModal>
        );
    }
}

export default Unlock;
