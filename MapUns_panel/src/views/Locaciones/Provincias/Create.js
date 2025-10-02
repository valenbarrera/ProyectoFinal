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
            <UnsModal
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
                <UnsLabeledInput label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
            </UnsModal>
        );
    }
}

export default Create;
