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
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
        });
    }

    render() {
        return (
            <ParadigmaModal
                postUrl={api.locaciones.provincias.create}
                onSubmit={(e) => this.props.onSubmit(e)}
                successMessage={"La Provincia ha sido creada con éxito."}
                title={"Nueva Provincia"}
                buttonTitle={"Nueva"}
                buttonIcon={"fa fa-plus fa-lg"}
                saveButton={true}
                closeButton={true}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
            </ParadigmaModal>
        );
    }
}

export default Create;
