import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import PermisosListSelect from "../Permisos/PermisosListSelect.js"


import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"


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


class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            grupo_id: null,
            permisos_checked: [],
            permisos_disabled: [],
            pk: 0
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    resetForm() {
        this.setState({
            activeTab: 1,
            grupo_id: null,
            permisos_checked: [],
            permisos_disabled: [],
            pk: 0
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
            permisos_checked: data.permisos,
            pk: data.pk,
        });
    }

    groupChanged(value) {
        if (value) {
            this.setState({
                grupo_id: value.pk,
                permisos_disabled: value.permisos,
                permisos_checked:[],
            });
        } else {
            this.setState({
                grupo_id: null,
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
            <ParadigmaModal
                getUrl={api.usuarios.usuarios.edit}
                postUrl={api.usuarios.usuarios.edit}
                onSubmit={(e) => this.props.onSubmit(e)}
                id={this.props.id}
                successMessage={"El Usuario ha sido editado con éxito."}
                missingIdMessage={"Debe seleccionar una fila."}
                title={"Editar Usuario"}
                buttonTitle={"Editar"}
                buttonIcon={"fa fa-pencil fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}
                onGotData={(data) => this.setSelects(data)}
                onClose={() => this.resetForm()}
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
                        <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Apellido"} fieldName={"last_name"} />
                        <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"first_name"} />
                        <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Usuario"} fieldName={"username"} />
                        <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Email"} fieldName={"email"} />
                        <Row className="mt-1">
                            <Col className="col-12 col-sm-6">
                                <ParadigmaLabeledInput labelColumns={12} fieldColumns={12} label={"Contraseña"} fieldName={"password"} type={"password"} />
                            </Col>
                            <Col className="col-12 col-sm-6">
                                <ParadigmaLabeledInput labelColumns={12} fieldColumns={12} label={"Repetir Contraseña"} fieldName={"password2"} type={"password"} />
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId={2} className="py-0">
                        <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Grupo"} inputComponent={
                            <ParadigmaAsyncSeeker
                                onExternalChange={(value) => this.groupLoaded(value)}
                                onChange={(value) => this.groupChanged(value)}
                                fieldName={"grupo_id"}
                                url={api.usuarios.grupos.select}
                                value={this.state.grupo_id}
                            />
                        }
                        />
                        <Row className="mt-2">
                            <Col className="col-12">
                                <Label>Permisos</Label>
                                <PermisosListSelect disabledNodes={this.state.permisos_disabled} onChange={(value) => this.setState({ permisos_checked: value })} checked={this.state.permisos_checked} fieldName={"permisos"} />
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
            </ParadigmaModal>
        );
    }
}

export default Edit;

