import React, { Component } from 'react';
import {
    Badge,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Dropdown,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Row,
    Label,
    Input,
    FormFeedback,
    Col
} from 'reactstrap';


import PermisosListDetail from "../../views/Usuarios/Permisos/PermisosListDetail.js"
import ParadigmaAsyncSeeker from "../ParadigmaAsyncSeeker/ParadigmaAsyncSeeker.js"
import ParadigmaLabeledInput from "../ParadigmaLabeledInput/ParadigmaLabeledInput.js"


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
import auth from '../../auth/'
import api from '../../api/'
import ParadigmaModal from '../ParadigmaModal'

import Perfil from '../../views/Usuarios/Usuarios/Perfil'

class HeaderDropdown extends Component {

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            dropdownOpen: false,
            PerfilOpen: false,
        };
    }
    Open() {
        this.setState({ PerfilOpen: true });
    }
    Close() {
        this.setState({ PerfilOpen: false });
    }

    toggle() {
        if (!this.state.PerfilOpen)
            this.setState({
                dropdownOpen: !this.state.dropdownOpen
            });
    }


    render() {
        const { ...attributes } = this.props;
        return (
            <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle nav>
                    <i className={"fa fa-user"}></i>
                </DropdownToggle>

                <DropdownMenu right>
                    <Perfil onOpen={() => this.setState({ PerfilOpen: true })} onClose={() => this.setState({ PerfilOpen: false })} />

                    <DropdownItem onClick={() => auth.logout()}><i className="fa fa-lock"></i> Salir</DropdownItem>

                </DropdownMenu>

            </Dropdown >
        );
    }
}

export default HeaderDropdown;
