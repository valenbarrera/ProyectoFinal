import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DropdownMenu, Dropdown, DropdownToggle, DropdownItem, Input, Label, FormGroup, UncontrolledTooltip } from 'reactstrap';

var checkStyle = {
    paddingLeft: '5px',
    paddingRight: '5px',
    margin: '0px',
};

class UnsTableHeader extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);

        this.toggleExport = this.toggleExport.bind(this);

        var tmpcolumns = this.props.listColumns;
        var localColumns = localStorage.getItem('table_' + this.props.title.split(' ').join(''));
        if (localColumns) {
            var newcolumns = JSON.parse(localColumns);
            for (var i = 0; i < newcolumns.length; i++) {
                var tmpcolumn = tmpcolumns.filter(x => x.id == newcolumns[i].id);
                if (tmpcolumn.length > 0) {
                    tmpcolumn[0].show = newcolumns[i].show;
                    tmpcolumn[0].width = newcolumns[i].width;
                }
            }
        }

        var defaultConfig = this.props.defaultConfig;
        var config = JSON.parse(localStorage.getItem('table_' + this.props.title.split(' ').join('') + "_config"));
        if (config != null && config.pageSize != defaultConfig.pageSize) {
            defaultConfig.pageSize = config.pageSize;
        }

        this.state = {
            dropdownOpen: false,
            dropdownExportOpen: false,
            selectedColumns: tmpcolumns,
            landscape: false,
            mode: 1,
            format: 1,
            defaultConfig: defaultConfig,
        };

    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
            dropdownExportOpen: false,
        });
    }

    toggleExport() {
        this.setState({
            dropdownExportOpen: !this.state.dropdownExportOpen,
            dropdownOpen: false
        });
    }

    static propTypes = {
        title: PropTypes.string.isRequired,
        onChange: PropTypes.func,
        listColumns: PropTypes.array.isRequired,
        defaultConfig: PropTypes.any,
        resizedColumns: PropTypes.any,
        onExport: PropTypes.func,
        onConfigChanged: PropTypes.func,
        showExport: PropTypes.bool,
        onExportFunc: PropTypes.func,
        useExportFunc:PropTypes.bool,
    }

    handleClick(e) {
        this.toggleColumn(e.target.id);
        this.updateLocalStorage();
        this.triggerChange();
    }

    changeRowCount(e) {
        var newpageSize = parseInt(e.target.value);
        var defaultConfig = this.state.defaultConfig;
        defaultConfig.pageSize = newpageSize;
        this.setState({ defaultConfig: defaultConfig });
        this.props.onConfigChanged(defaultConfig);
        this.updateLocalStorage();
    }

    updateLocalStorage() {
        localStorage.setItem("table_" + this.props.title.split(' ').join(''), JSON.stringify(this.state.selectedColumns));
        localStorage.setItem("table_" + this.props.title.split(' ').join('') + "_config", JSON.stringify(this.state.defaultConfig));
    }

    triggerChange() {
        if (this.props.onChange) this.props.onChange(this.state.selectedColumns);
    }

    toggleColumn(id) {
        var tmpColumns = this.state.selectedColumns;
        for (var i = 0; i < tmpColumns.length; i++) {
            var column = tmpColumns[i];
            if (column.id == id) {
                column.show = !column.show;
            }
        }
        this.setState({ selectedColumns: tmpColumns });
    }

    resizeColumn(id, width) {
        var tmpColumns = this.state.selectedColumns;
        for (var i = 0; i < tmpColumns.length; i++) {
            var column = tmpColumns[i];
            if (column.id == id) {
                column.width = width;
            }
        }
        this.setState({ selectedColumns: tmpColumns });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.resizedColumns) {
            var resize = nextProps.resizedColumns;
            var tmpColumns = this.state.selectedColumns;

            for (var j = 0; j < resize.length; j++) {
                for (var i = 0; i < tmpColumns.length; i++) {
                    var column = tmpColumns[i];
                    if (column.id == resize[j].id) {
                        column.width = resize[j].value;
                    }
                }
            }
            this.setState({ selectedColumns: tmpColumns });
            this.updateLocalStorage();
        }
        if (nextProps.defaultConfig != this.state.defaultConfig)
            this.setState({ defaultConfig: nextProps.defaultConfig });
    }

    export() {
        if (this.props.onExport)
            this.props.onExport(this.state.format, this.state.mode, this.state.landscape);
    }

    selectFormat(format) {
        this.setState({ format: format });
    }


    selectOrientation(format) {
        this.setState({ landscape: format });
    }


    selectMode(mode) {
        this.setState({ mode: mode });
    }

    render() {
        var checks = [];
        var columns = this.props.listColumns;
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (!column.private) {
                checks[checks.length] = (
                    <div key={i} style={checkStyle}>
                        <FormGroup check>
                            <Label for={column.id} className="w-100" check>
                                <Input type="checkbox" id={column.id} name={column.id} checked={column.show} onChange={(e) => this.handleClick(e)} />{' '}
                                {column.Header}
                            </Label>
                        </FormGroup>
                    </div>
                );
            }
        }

        return (
            <div>
                <h4 className="rt-thead-title mb-2 mb-sm-0">{this.props.title}</h4>
                <div className="d-flex flex-row justify-content-between flex-wrap" style={{}}>

                    <div className="d-flex flex-row justify-content-center left-buttons">
                        {this.props.toolbarButtons}
                    </div>

                    <div className="d-flex flex-row justify-content-center right-buttons">
                        {this.props.btnHelp && 
                            <div className="mr-2">
                                {this.props.btnHelp}
                            </div>
                        }
                        {
                            !this.props.multiSelect &&
                            (this.props.total.filtered != this.props.total.total ?
                                <label className="d-none d-sm-block pr-2 mt-1 mb-0 float-right">Mostrando {this.props.total.show} de {this.props.total.filtered} (filtrados de {this.props.total.total})</label>
                                :
                                <label className="d-none d-sm-block pr-2 mt-1 mb-0 float-right">Mostrando {this.props.total.show} de {this.props.total.filtered}</label>
                            )
                        }

                        {
                            this.props.multiSelect &&
                            (this.props.total.filtered != this.props.total.total ?
                                <label className="d-none d-sm-block pr-2 mt-1 mb-0 float-right">Mostrando {this.props.total.show} de {this.props.total.filtered} (filtrados de {this.props.total.total}) ({this.props.total.selected} filas seleccionadas)</label>
                                :
                                <label className="d-none d-sm-block pr-2 mt-1 mb-0 float-right">Mostrando {this.props.total.show} de {this.props.total.filtered} ({this.props.total.selected} filas seleccionadas)</label>
                            )
                        }

                        <Dropdown className="d-inline-block mr-2" isOpen={this.state.dropdownDebajaOpen} toggle={() => this.setState({  dropdownDebajaOpen: !this.state.dropdownDebajaOpen })}>
                            <DropdownToggle caret className="btn-sm btn-secondary">
                                {this.props.debajaFilter === null ? "Todos" : (this.props.debajaFilter === true ? "Regulares" : "No regulares")}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.props.onDebajaFilterChange(null)}>Todos</DropdownItem>
                                <DropdownItem onClick={() => this.props.onDebajaFilterChange(true)}>Regulares</DropdownItem>
                                <DropdownItem onClick={() => this.props.onDebajaFilterChange(false)}>No regulares</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        <div className="d-inline-block position-relative">
                            <button
                                id="refreshBtn"
                                className="icon btn btn-secondary btn-sm h-100"
                                onClick={ e => {
                                    if (e) e.preventDefault();
                                    this.props.onUpdate();
                                } }
                            >
                                <i className="fa fa-repeat fa-lg"></i>
                                <UncontrolledTooltip placement="bottom" target={"refreshBtn"}>Actualizar Tabla</UncontrolledTooltip>
                            </button>
                        </div>

                        {this.props.showExport && this.props.useExportFunc == false &&
                            <Dropdown className="d-inline-block" isOpen={this.state.dropdownExportOpen} toggle={this.toggleExport}>
                                <DropdownToggle id="exportBtn" className="btn-sm background-transparent border-transparent h-100">
                                    <i className="fa fa-download fa-lg"></i>
                                    <UncontrolledTooltip className={(this.state.dropdownExportOpen ? "d-none" : "")} placement="bottom"
                                        target={"exportBtn"}>Exportar datos</UncontrolledTooltip>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem header>Formato</DropdownItem>
                                    <FormGroup tag="fieldset" className="mb-0 mx-2">
                                        <FormGroup check className="d-inline-block w-50 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio1" checked={(this.state.format == 1 ? true : false)}
                                                    onChange={() => this.selectFormat(1)} />{' '}PDF
                                        </Label>
                                        </FormGroup>
                                        <FormGroup check className="d-inline-block w-50 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio1" checked={(this.state.format == 2 ? true : false)}
                                                    onChange={() => this.selectFormat(2)} />{' '}EXCEL
                                        </Label>
                                        </FormGroup>
                                    </FormGroup>

                                    <DropdownItem header>Orientacion</DropdownItem>
                                    <FormGroup tag="fieldset" className="mb-0 mx-2">
                                        <FormGroup check className="d-inline-block w-50 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio3" checked={!this.state.landscape}
                                                    onChange={() => this.selectOrientation(false)} />{' '}
                                                <i className="fa fa-mobile-phone fa-lg"></i>
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check className="d-inline-block w-50 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio3" checked={this.state.landscape}
                                                    onChange={() => this.selectOrientation(true)} />{' '}
                                                <i className="fa fa-mobile-phone rot-90 fa-lg"></i>
                                            </Label>
                                        </FormGroup>
                                    </FormGroup>


                                    <DropdownItem header>Modo</DropdownItem>
                                    <FormGroup tag="fieldset" className="mb-0 mx-2">
                                        <FormGroup check className="d-inline-block w-100 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio2" checked={(this.state.mode == 1 ? true : false)}
                                                    onChange={() => this.selectMode(1)} />{' '}Pagina Actual
                                        </Label>
                                        </FormGroup>
                                        <FormGroup check className="d-inline-block w-100 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio2" checked={(this.state.mode == 2 ? true : false)}
                                                    onChange={() => this.selectMode(2)} />{' '}Lista Filtrada
                                        </Label>
                                        </FormGroup>
                                        <FormGroup check className="d-inline-block w-100 m-auto">
                                            <Label check>
                                                <Input type="radio" name="radio2" checked={(this.state.mode == 3 ? true : false)}
                                                    onChange={() => this.selectMode(3)} />{' '}Lista Completa
                                        </Label>
                                        </FormGroup>
                                    </FormGroup>
                                    <button className="icon btn btn-secondary btn-sm float-right background-transparent border-transparent w-100"
                                        onClick={(e) => this.export()}>
                                        <i className="fa fa-download fa-lg"></i>{' '} GENERAR
                                </button>

                                </DropdownMenu>
                            </Dropdown>
                        }
                        {
                             this.props.showExport && this.props.useExportFunc == true &&
                             <React.Fragment>
                                  <UncontrolledTooltip
                                  className={(this.state.dropdownExportOpen ? "d-none" : "")}
                                  placement="bottom"
                                  target={"exportBtn"}>
                                  Exportar
                                  </UncontrolledTooltip>
                                  <button
                                  id="exportBtn"
                                  className="icon btn btn-secondary btn-sm float-right background-transparent border-transparent"
                                  onClick={(e) => {if(this.props.onExportFunc) this.props.onExportFunc();}}>
                                  <i className="fa fa-download fa-lg"></i>{' '}
                                  </button>
                             </React.Fragment>
                        }
                        <Dropdown className="d-inline-block" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle id="configureBtn" className="btn-sm background-transparent border-transparent h-100">
                                <i className="fa fa-cog fa-lg"></i>
                                <UncontrolledTooltip className={(this.state.dropdownOpen ? "d-none" : "")} placement="bottom"
                                    target={"configureBtn"}>Configurar Tabla</UncontrolledTooltip>
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem header>Configuración</DropdownItem>
                                <div className={"row mx-0"} style={checkStyle}>
                                    <div className={"col-8 px-0"}>
                                        <Label for={column.id} className="w-100 h-100 m-0">Filas por Página</Label>
                                    </div>
                                    <div className={"col-4 px-0"}>
                                        <Input type="number" value={this.state.defaultConfig.pageSize} className={"p-0 text-right"}
                                            onChange={(e) => this.changeRowCount(e)} />
                                    </div>
                                </div>
                                <DropdownItem header>Columnas</DropdownItem>
                                {checks}
                            </DropdownMenu>
                        </Dropdown>

                    </div>

                </div>
            </div>
        );
    }
};

module.exports = UnsTableHeader;
