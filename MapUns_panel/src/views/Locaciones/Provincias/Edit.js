import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput"

class Edit extends Component {
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
                getUrl={api.locaciones.provincias.edit}
                postUrl={api.locaciones.provincias.edit}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"La Provincia ha sido editada con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Provincia"}
                buttonTitle={"Editar"}
                buttonIcon={"fa fa-pencil fa-lg"}
                saveButton={true}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
            </ParadigmaModal>
        );
    }
}

export default Edit;
