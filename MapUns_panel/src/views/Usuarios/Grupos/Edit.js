import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import PermisosListSelect from "../Permisos/PermisosListSelect.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"

var groupLoaded = false;
class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pk: null,
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            activeTab: 1,
            pk: null,
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        });
        groupLoaded = false;
    }

    setSelects(data) {
        if (data.padre_id) {
            this.setState({
                padre_id: data.padre_id,
                permisos_checked: data.Permisos,
                pk: data.pk
            });
        } else {
            this.setState({
                padre_id: null,
                permisos_checked: data.Permisos,
                pk: data.pk
            });
        }
    }

    groupChanged(value) {
        if (value) {
            this.setState({
                padre: value.pk,
                permisos_disabled: value.permisos,
                permisos_checked: [],
            });
        } else {
            this.setState({
                padre: null,
                permisos_disabled: [],
                permisos_checked: [],
            });
        }
    }


    groupLoaded(value) {
        if (value != undefined && !groupLoaded) {
            groupLoaded = true;
            this.setState({
                permisos_disabled: value.permisos
            });
        }
    }

    render() {
        return (
            <ParadigmaModal
                getUrl={api.usuarios.grupos.edit}
                postUrl={api.usuarios.grupos.edit}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Grupo ha sido editado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Grupo"}
                buttonTitle={"Editar"}
                buttonIcon={"fa fa-pencil fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <ParadigmaLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <ParadigmaAsyncSeeker
                        onExternalChange={(value) => this.groupLoaded(value)}
                        onChange={(value) => this.groupChanged(value)}
                        fieldName={"padre_id"}
                        url={api.usuarios.grupos.select + (this.state.pk ? "?exclude=" + this.state.pk : "")}
                        value={this.state.padre_id}
                    />
                } />

                <Row className="mt-4">
                    <Col className="col-12">
                        <Label>Permisos</Label>
                        <PermisosListSelect fieldName={"permisos"} disabledNodes={this.state.permisos_disabled} onChange={(value) => this.setState({ permisos_checked: value })} checked={this.state.permisos_checked} />
                    </Col>
                </Row>
            </ParadigmaModal>
        );
    }
}

export default Edit;
