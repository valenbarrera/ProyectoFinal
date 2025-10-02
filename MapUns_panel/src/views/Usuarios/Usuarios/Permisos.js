import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ParadigmaModal from "../../../components/ParadigmaModal/ParadigmaModal.js"
import PermisosListSelect from "../Permisos/PermisosListSelect.js"
import api from "../../../api";

import {Row, Col, Label, Input, InputGroup,FormFeedback} from 'reactstrap';


class Permissions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: []
        };
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        id: PropTypes.func.isRequired,
    }

    setSelect(data){
        this.setState({
            checked:data.Permisos
        });
    }

    render() {
        return (
            <ParadigmaModal 
            getUrl={api.usuarios.usuarios.permisos} 
            postUrl={api.usuarios.usuarios.permisos} 
            onSubmit={(e) => this.props.onSubmit(e)}  
            id={this.props.id} 
            successMessage={"Los Permisos del Usuario han sido guardados con éxito."} 
            missingIdMessage={"Debe seleccionar una fila."} 
            title={"Editar Permisos de Usuario"} 
            buttonTitle={"Editar Permisos"}
            buttonIcon={"fa fa-th-list fa-lg"} 
            submit={(callback) => this.submit(callback)} 
            saveButton={true} 
            closeButton={true}
            onGotData={(data) => this.setSelect(data)}>
                <Row>
                    <Col className="col-12">
                        <PermisosListSelect fieldName={"permisos"} checked={this.state.checked} />
                    </Col>
                </Row>
            </ParadigmaModal>
        );
    }
}

export default Permissions;
