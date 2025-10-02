import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"

class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            padre_id: null,
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            padre_id: null,
        });
    }

    setSelects(data) {
        if (data.padre_id)
            this.setState({
                padre_id: data.padre_id,
            });
    }
    render() {
        return (
            <ParadigmaModal
                getUrl={api.usuarios.permisos.edit}
                postUrl={api.usuarios.permisos.edit}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Permiso ha sido editado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Permiso"}
                buttonTitle={"Editar"}
                buttonIcon={"fa fa-pencil fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}
                onClose={() => this.resetForm()}
                onGotData={(data) => this.setSelects(data)}>
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <ParadigmaAsyncSeeker fieldName={"padre_id"} url={api.usuarios.permisos.select} value={this.state.padre_id} />
                } />
                <ParadigmaLabeledInput labelColumns={12} fieldColumns={12} label={"Descripcion"} type={"textarea"} rows={2} fieldName={"descripcion"} />
            </ParadigmaModal>
        );
    }
}

export default Edit;
