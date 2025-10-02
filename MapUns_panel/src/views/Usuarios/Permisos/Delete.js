import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"

class Delete extends Component {
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
                getUrl={api.usuarios.permisos.delete}
                postUrl={api.usuarios.permisos.delete}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Permiso ha sido eliminado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Eliminar Permiso"}
                buttonTitle={"Eliminar"}
                buttonIcon={"fa fa-trash fa-lg"}
                submit={(callback) => this.submit(callback)}
                buttonClass={"btn-danger"} 
                saveButton={true}
                closeButton={true}
                danger={true}
                buttonClass={"btn-danger"} 
                saveButtonLabel={"Eliminar"}
                onClose={() => this.resetForm()}
                onGotData={(data) => this.setSelects(data)}>
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <ParadigmaAsyncSeeker disabled={true} fieldName={"padre_id"} url={api.usuarios.permisos.select} value={this.state.padre_id} />
                } />
                <ParadigmaLabeledInput disabled={true} labelColumns={12} fieldColumns={12} label={"Descripcion"} type={"textarea"} rows={2} fieldName={"descripcion"} />
                
            </ParadigmaModal>
        );
    }
}

export default Delete;
