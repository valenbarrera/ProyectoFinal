import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput"

class Delete extends Component {
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
            <UnsModal
                getUrl={api.locaciones.localidades.delete}
                postUrl={api.locaciones.localidades.delete}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"La Localidad ha sido eliminada con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Eliminar Localidad"}
                buttonTitle={"Eliminar"}
                buttonIcon={"fa fa-trash fa-lg"}
                buttonClass={"btn-danger"} 
                saveButtonLabel={"Eliminar"}
                saveButton={true}
                closeButton={true}
                danger={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <UnsLabeledInput disabled={true} label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
                <UnsLabeledInput disabled={true} label={"Código Postal"} fieldName={"cp"} labelColumns={2} fieldColumns={10} />
                <UnsLabeledInput label={"Provincia"} labelColumns={2} fieldColumns={10}
                    inputComponent={<UnsAsyncSeeker
                        clearable={false}
                        disabled={true}
                        url={api.locaciones.provincias.select}
                        fieldName={"provincia_id"}
                        value={this.state.provincia_id}
                        onChange={(data) => this.setState({provincia_id:data.pk})}
                    />} />
            </UnsModal>
        );
    }
}

export default Delete;
