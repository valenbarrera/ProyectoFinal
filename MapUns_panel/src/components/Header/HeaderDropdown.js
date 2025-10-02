import React, { Component } from 'react';
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Dropdown,
} from 'reactstrap';
import auth from '../../auth/'
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
