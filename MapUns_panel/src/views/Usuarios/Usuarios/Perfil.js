import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnsModal from "../../../components/UnsModal/UnsModal.js"
import api from "../../../api";


import PermisosListDetail from "../Permisos/PermisosListDetail.js"

import UnsAsyncSeeker from "../../../components/UnsAsyncSeeker/UnsAsyncSeeker.js"
import UnsLabeledInput from "../../../components/UnsLabeledInput/UnsLabeledInput.js"


import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';
var TabHeaderStyle = {
    marginTop: '-15px',
    marginRight: '-15px',
    marginBottom: '0px',
    marginLeft: '-15px',
};

var TabHeaderBody = {
    marginTop: '0px',
    marginRight: '-15px',
    marginBottom: '-15px',
    marginLeft: '-15px',
};

var groupLoaded = false;


class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            grupo_id: null,
            permisos_checked: [],
            permisos_disabled: [],
            pk: 0,
        };
    }

    static propTypes = {
        onOpen: PropTypes.func,
        onClose: PropTypes.func,
    }

    resetForm() {
        this.setState({
            activeTab: 1,
            grupo_id: null,
            permisos_checked: [],
            permisos_disabled: [],
            pk: 0,
        });
        groupLoaded = false;
    }

    getActiveClass(tabN) {
        if (this.state.activeTab == tabN)
            return "active";
        else
            return "";
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    setSelects(data) {
        this.setState({
            grupo_id: data.grupo_id,
            persona: data.persona_id,
            permisos_checked: data.permisos,
            pk: data.pk,
        });
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
                navButton={true}
                nav={({
                    name: 'Perfil',
                    icon: 'fa fa-user',
                    tag: 'button',
                    className: 'dropdown-item'
                })}
                getUrl={api.usuarios.usuarios.perfil}
                postUrl={api.usuarios.usuarios.perfil}
                successMessage={"El Usuario ha sido editado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Perfil"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                className={"dropdown-item"}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
                onOpen={() => (this.props.onOpen ? this.props.onOpen() : null)}
                onClose={() => (this.props.onClose ? this.props.onClose() : null)}
                onCleanForm={() => this.resetForm()}
            >
                <Nav tabs style={TabHeaderStyle}>
                    <NavItem>
                        <NavLink className={this.getActiveClass(1)} onClick={() => { this.toggleTab(1); }}>
                            Usuario
                    </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={this.getActiveClass(2)} onClick={() => { this.toggleTab(2); }}>
                            Permisos
                    </NavLink>
                    </NavItem>
                </Nav>
                <TabContent style={TabHeaderBody} activeTab={this.state.activeTab} className={"py-2"}>
                    <TabPane tabId={1} className="py-0">
                        <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Apellido"} fieldName={"last_name"} />
                        <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"first_name"} />
                        <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Usuario"} fieldName={"username"} />
                        <UnsLabeledInput disabled={true} labelColumns={2} fieldColumns={10} label={"Email"} fieldName={"email"} />
                        <Row className="mt-1">
                            <Col className="col-12 col-sm-6">
                                <UnsLabeledInput labelColumns={12} fieldColumns={12} label={"Contraseña"} fieldName={"password"} type={"password"} />
                            </Col>
                            <Col className="col-12 col-sm-6">
                                <UnsLabeledInput labelColumns={12} fieldColumns={12} label={"Repetir Contraseña"} fieldName={"password2"} type={"password"} />
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId={2} className="py-0">
                        <UnsLabeledInput labelColumns={2} fieldColumns={10} label={"Grupo"} inputComponent={
                            <UnsAsyncSeeker
                                disabled={true}
                                onExternalChange={(value) => this.groupLoaded(value)}
                                onChange={(value) => this.groupChanged(value)}
                                fieldName={"grupo_id"}
                                url={api.usuarios.grupos.select}
                                value={this.state.grupo_id} />
                        }
                        />
                        <Row className="mt-2">
                            <Col className="col-12">
                                <Label>Permisos</Label>
                                <PermisosListDetail disabledNodes={this.state.permisos_disabled} onChange={(value) => this.setState({ permisos_checked: value })} checked={this.state.permisos_checked} fieldName={"permisos"} />
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
            </UnsModal>
        );
    }
}

export default Perfil;

