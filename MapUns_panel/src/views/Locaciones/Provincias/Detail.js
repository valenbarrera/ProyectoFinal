import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput"

class Detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static propTypes = {
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
                getUrl={api.locaciones.provincias.detail}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Provincia"}
                buttonTitle={"Ver"}
                buttonIcon={"fa fa-search fa-lg"}
                saveButton={false}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput disabled={true} label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />

            </ParadigmaModal>
        );
    }
}

export default Detail;
