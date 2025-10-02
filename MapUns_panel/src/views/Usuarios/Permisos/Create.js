import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput/UnsLabeledInput.js"



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

    render() {
        return (
            <UnsModal
                postUrl={api.usuarios.permisos.create}
                onSubmit={(e) => this.props.onSubmit(e)}
                successMessage={"El Permiso ha sido creado con éxito."}
                title={"Nuevo Permiso"}
                buttonTitle={"Nuevo"}
                buttonIcon={"fa fa-plus fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}>
                <UnsLabeledInput labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <UnsLabeledInput labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <UnsAsyncSeeker fieldName={"padre_id"} url={api.usuarios.permisos.select} />
                } />
                <UnsLabeledInput labelColumns={12} fieldColumns={12} label={"Descripcion"} type={"textarea"} rows={2} fieldName={"descripcion"} />
            </UnsModal>
        );
    }
}

export default Create;
