import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"



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
            <ParadigmaModal
                postUrl={api.usuarios.permisos.create}
                onSubmit={(e) => this.props.onSubmit(e)}
                successMessage={"El Permiso ha sido creado con éxito."}
                title={"Nuevo Permiso"}
                buttonTitle={"Nuevo"}
                buttonIcon={"fa fa-plus fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}>
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <ParadigmaAsyncSeeker fieldName={"padre_id"} url={api.usuarios.permisos.select} />
                } />
                <ParadigmaLabeledInput labelColumns={12} fieldColumns={12} label={"Descripcion"} type={"textarea"} rows={2} fieldName={"descripcion"} />
            </ParadigmaModal>
        );
    }
}

export default Create;
