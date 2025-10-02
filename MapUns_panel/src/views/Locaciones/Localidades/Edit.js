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
            provincia_id: null
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            provincia_id: null
        });
    }

    setSelects(data) {
        this.setState({
            provincia_id: data.provincia_id
        })
    }

    render() {
        return (
            <ParadigmaModal
                getUrl={api.locaciones.localidades.edit}
                postUrl={api.locaciones.localidades.edit}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"La Localidad ha sido editada con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Localidad"}
                buttonTitle={"Editar"}
                buttonIcon={"fa fa-pencil fa-lg"}
                saveButton={true}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
                <ParadigmaLabeledInput label={"Código Postal"} fieldName={"cp"} labelColumns={2} fieldColumns={10} />
                <ParadigmaLabeledInput label={"Provincia"} labelColumns={2} fieldColumns={10}
                    inputComponent={<ParadigmaAsyncSeeker
                        clearable={false}
                        url={api.locaciones.provincias.select}
                        fieldName={"provincia_id"}
                        value={this.state.provincia_id}
                        onChange={(data) => this.setState({provincia_id:data.pk})}
                    />} />
            </ParadigmaModal>
        );
    }
}

export default Edit;
