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
            provincia_id: null
        };
    }

    static propTypes = {
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
                getUrl={api.locaciones.localidades.detail}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Localidad"}
                buttonTitle={"Ver"}
                buttonIcon={"fa fa-search fa-lg"}
                saveButton={false}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput disabled={true} label={"Nombre"} fieldName={"nombre"} labelColumns={2} fieldColumns={10} />
                <ParadigmaLabeledInput disabled={true} label={"Código Postal"} fieldName={"cp"} labelColumns={2} fieldColumns={10} />
                <ParadigmaLabeledInput label={"Provincia"} labelColumns={2} fieldColumns={10}
                    inputComponent={<ParadigmaAsyncSeeker 
                        clearable={false}
                        disabled={true}
                        url={api.locaciones.provincias.select}
                        fieldName={"provincia_id"}
                        value={this.state.provincia_id}
                        onChange={(data) => this.setState({provincia_id:data.pk})}
                    />} />
            </ParadigmaModal>
        );
    }
}

export default Detail;
