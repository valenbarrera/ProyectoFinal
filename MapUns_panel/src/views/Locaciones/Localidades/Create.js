import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker"
import UnsLabeledInput from "../../../components/UnsLabeledInput"

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            provincia_id: null
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            provincia_id: null
        });
    }

    render() {
        return (
            <UnsModal
                postUrl={api.locaciones.localidades.create}
                onSubmit={(e) => this.props.onSubmit(e)}
                successMessage={"La Localidad ha sido creada con éxito."}
                title={"Nueva Localidad"}
                buttonTitle={"Nueva"}
                buttonIcon={"fa fa-plus fa-lg"}
                saveButton={true}
                closeButton={true}
                onClose={() => this.resetForm()}
            >
                <UnsLabeledInput label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
                <UnsLabeledInput label={"Código Postal"} fieldName={"cp"} labelColumns={2} fieldColumns={10} />
                <UnsLabeledInput label={"Provincia"} labelColumns={2} fieldColumns={10}
                    inputComponent={<UnsAsyncSeeker
                        clearable={false}
                        url={api.locaciones.provincias.select}
                        fieldName={"provincia_id"}
                        value={this.state.provincia_id}
                        onChange={(data) => this.setState({provincia_id:data.pk})}
                    />} />
            </UnsModal>
        );
    }
}

export default Create;
