import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput"

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
            <ParadigmaModal
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

export default Create;
