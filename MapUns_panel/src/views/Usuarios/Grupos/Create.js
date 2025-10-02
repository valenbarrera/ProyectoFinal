import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import api from "../../../api";

import ParadigmaAsyncSeeker from "../../../components/ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import PermisosListSelect from "../Permisos/PermisosListSelect.js"
import ParadigmaLabeledInput from "../../../components/ParadigmaLabeledInput/ParadigmaLabeledInput.js"


import { Row, Col, Label, Input, InputGroup, FormFeedback } from 'reactstrap';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
    }

    ResetForm() {
        this.setState({
            padre_id: null,
            permisos_checked: [],
            permisos_disabled: []
        });
    }

    groupChanged(value) {
        if (value) {
            this.setState({
                padre_id: value.pk,
                permisos_disabled: value.permisos,
                permisos_checked: [],
            });
        } else {
            this.setState({
                padre_id: null,
                permisos_disabled: [],
                permisos_checked: [],
            });
        }
    }

    render() {
        return (
            <ParadigmaModal
                postUrl={api.usuarios.grupos.create}
                onSubmit={(e) => this.props.onSubmit(e)}
                successMessage={"El Grupo ha sido creado con éxito."}
                title={"Nuevo Grupo"}
                buttonTitle={"Nuevo"}
                buttonIcon={"fa fa-plus fa-lg"}
                submit={(callback) => this.submit(callback)}
                saveButton={true}
                closeButton={true}
                onClose={() => this.ResetForm()}
            >
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Nombre"} fieldName={"nombre"} />
                <ParadigmaLabeledInput labelColumns={2} fieldColumns={10} label={"Padre"} inputComponent={
                    <ParadigmaAsyncSeeker
                        value={this.state.padre_id}
                        onChange={(value) => this.groupChanged(value)}
                        fieldName={"padre_id"}
                        url={api.usuarios.grupos.select}
                    />
                } />
                <Row className="mt-4">
                    <Col className="col-12">
                        <Label>Permisos</Label>
                        <PermisosListSelect
                            fieldName={"permisos"}
                            disabledNodes={this.state.permisos_disabled}
                            onChange={(value) => this.setState({ permisos_checked: value })}
                            checked={this.state.permisos_checked}
                        />
                    </Col>
                </Row>
            </ParadigmaModal>
        );
    }
}

export default Create;
