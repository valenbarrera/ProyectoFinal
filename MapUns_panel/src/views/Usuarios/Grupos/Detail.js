import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";

import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import PermisosListDetail from "../Permisos/PermisosListDetail.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput/UnsLabeledInput.js"

var groupLoaded = false;
class Detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        };
    }

    static propTypes = {
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            activeTab: 1,
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        });
        groupLoaded = false;
    }

    setSelects(data) {
        if (data.padre_id) {
            this.setState({
                padre: data.padre_id,
                permisos_checked: data.Permisos
            });
        } else {
            this.setState({
                padre_id: null,
                permisos_checked: data.Permisos
            });
        }
    }

    groupChanged(value) {
        if (value) {
            this.setState({
                padre: value.pk,
                permisos_disabled: value.permisos,
                permisos_checked:[],
            });
        } else {
            this.setState({
                padre_id: null,
                permisos_disabled: [],
                permisos_checked:[],
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
            <UnsModal
                getUrl={api.usuarios.grupos.detail}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Grupo"}
                buttonTitle={"Ver"}
                buttonIcon={"fa fa-search fa-lg"}
                saveButton={false}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
            >
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <UnsAsyncSeeker
                        disabled={true}
                        onExternalChange={(value) => this.groupLoaded(value)}
                        onChange={(value) => this.groupChanged(value)}
                        fieldName={"padre_id"}
                        url={api.usuarios.grupos.select}
                        value={this.state.padre_id} />
                } />
                <Row className="mt-4">
                    <Col className="col-12">
                        <Label>Permisos</Label>
                        <PermisosListDetail fieldName={"permisos"} disabledNodes={this.state.permisos_disabled} onChange={(value) => this.setState({ permisos_checked: value })} checked={this.state.permisos_checked} />
                    </Col>
                </Row>
            </UnsModal>
        );
    }
}

export default Detail;
