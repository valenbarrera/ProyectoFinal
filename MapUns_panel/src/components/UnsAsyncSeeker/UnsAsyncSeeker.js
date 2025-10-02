import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Async } from 'react-select';
import { Input, Row, FormFeedback } from 'reactstrap';
import axios from "axios";

import auth from "../../auth";

import "./scss/default.scss";
import "./custom.scss";

class UnsAsyncSeeker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            pk: null,
            options: [],
            url: '',
            pkField: (this.props.pkField != undefined ? this.props.pkField : 'pk'),
            nombreField: (this.props.nombreField != undefined ? this.props.nombreField : 'nombre'),
            changedUrl: false,
            searchTimeout: null,
            searching: false,
        };
    }

    static propTypes = {
        fieldName: PropTypes.string.isRequired,
        label: PropTypes.string,
        onChange: PropTypes.func,
        onExternalChange: PropTypes.func,
        value: PropTypes.any,
        disabled: PropTypes.bool,
        url: PropTypes.string,
        nombreField: PropTypes.string,
        pkField: PropTypes.string,
        autoFocus: PropTypes.bool,
        clearable: PropTypes.bool,
        CreateComponent: PropTypes.any,
        DetailComponent: PropTypes.any,
        multiselect: PropTypes.bool,
        loadingPlaceholder: PropTypes.string,
        placeholder: PropTypes.string,
        searchPromptText: PropTypes.string,
        optionsFields: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.string),
            PropTypes.arrayOf(PropTypes.shape({
                field: PropTypes.string,
                cols: function (props, propName, componentName) {
                    if (typeof props[propName] !== 'number' || props[propName] > 12) {
                        return new Error(
                            'Invalid prop `' + propName + '` supplied to' +
                            ' `' + componentName + '`. Validation failed.' +
                            'It must be a number less than or equal to 12.'
                        );
                    }
                },
                renderCallback: PropTypes.func,
                type: PropTypes.oneOf(['image', 'text']),
                label: PropTypes.string
            }))
        ])
    }

    componentWillReceiveProps(nextProps) {
        const { multiselect, onExternalChange } = this.props;
        const { value, url } = nextProps;
        if (value != this.props.value) {
            this.setState(
                () => ({
                    value: multiselect ? value.map(pk => this.getOption(pk)) : this.getOption(value),
                    pk: value,
                    changedUrl: true,
                }),
                () => onExternalChange && onExternalChange(this.state.value)
            );
        }

        if (this.props.url !== url) {
            this.getOptions(url);
            this.setState({ changedUrl: true });
        }
    }

    componentDidUpdate() {
        if (this.state.changedUrl) {
            this.setState({ changedUrl: false });
        }
    }

    onInputChange = e => this.setState({ pk: e.target.value });

    onSelectChange = value => {
        let pk;
        if (this.props.multiselect) {
            pk = value ? value.map(x => x[this.state.pkField]).toString() : [];
        } else {
            pk = value ? value[this.state.pkField] : null;
        }
        this.setState({ value, pk, searching: false });

        if (this.props.onChange) this.props.onChange(value);
    }

    onMenuClosed = () => {
        this.setState({ searching: false });
    }

    loadOptions = (input, callback) => {
        let url = this.props.url;
        if (input != "") {
            url = this.urlAddParameter(url, "=", this.state.nombreField, input);

            this.setState(
                () => ({ searching: true }),
                () => this.getOptions(url, callback)
            );
        } else {
            if (this.state.pk) {
                url = this.urlAddParameter(url, "=", "pks", this.state.pk.toString());
            }
            this.getOptions(url, callback);
        }
    }

    urlAddParameter(url, operator, parameter, value) {
        if (url[url.length - 1] == "/")
            url += "?";
        else
            url += "&";
        return url + parameter + operator + value;
    }

    getOptions = (url, callback) => {
        let f = () => {
            // Consulta las opciones al backend
            axios.get(url, auth.header())
                .then(response => {
                    // Si hay filas, las agrega al estado y 
                    // ejecuta el callback del componente
                    if (response.data.rows) {
                        this.setState(
                            () => ({ options: response.data.rows, searchTimeout: null }),
                            () => {
                                const { value } = this.props;
                                const { searching } = this.state;
                                // Genera una option deshabilitada como label
                                let rows = response.data.rows;

                                const { optionsFields } = this.props;
                                if (optionsFields && typeof optionsFields[0] === 'object') {
                                    let labels = optionsFields.reduce((red, optField) => {
                                        red[optField.field] = optField.label;
                                        return red;
                                    }, {});
                                    labels['disabled'] = true;
                                    rows.unshift(labels);
                                }

                                // Devuelve el callback con las columnas                            
                                if (callback) callback(null, {
                                    options: rows,
                                    complete: false
                                });

                                // Si el componente recibe un valor, lo setea
                                if (this.props.value != this.state.value && !searching) this.resetState();
                            }
                        );
                    }
                });
        };

        if (this.state.searching) {
            clearTimeout(this.state.searchTimeout);
            let searchTimeout = setTimeout(f, 250);
            this.setState({ searchTimeout });
        } else {
            f();
        }
    }

    resetState = () => {
        // Si es multiselect, recorre las pk y las setea en el estado,
        // sino setea el estado con la única pk
        const { value, multiselect, onExternalChange } = this.props;
        this.setState(
            () => ({
                value: multiselect ? value.map(pk => this.getOption(pk)) : this.getOption(value),
                pk: value
            }),
            () => {
                if (onExternalChange)
                    onExternalChange(this.state.value)
            }
        );
    }

    getOption = value => {
        // Busca en el array de opciones el valor deseado
        const { options, pkField } = this.state;
        return options.find(option => option[pkField] === value);
    }

    created = value => {
        this.loadOptions('', res => {
            const option = this.getOption(value[this.state.pkField]);
            this.onSelectChange(option);
        });
    }

    renderOption = option => {
        const { optionsFields } = this.props;
        const { nombreField } = this.state;
        return (
            optionsFields ?

                <div className="row px-0" style={{ width: '500px' }}>
                    {
                        optionsFields.map(optionField => {

                            if (typeof optionField === 'string') {
                                const columns = Math.max(Math.floor(12 / optionsFields.length), 1);
                                return (
                                    <div className={'col-' + columns} key={optionField} >
                                        {option[optionField]}
                                    </div>
                                );
                            } else if (typeof optionField === 'object') {
                                const { field, renderCallback, cols, type } = optionField;

                                const optionValue = (type === 'image') ?
                                    <img src={option[field]} width="15" height="15" alt={field} /> :
                                    option[field];

                                return (
                                    <Fragment key={field}>
                                        {renderCallback ?

                                            renderCallback(optionValue) :

                                            <div className={'col-' + cols}>
                                                {optionValue}
                                            </div>
                                        }
                                    </Fragment>
                                );
                            }
                        })
                    }
                </div> :

                <span>{option[nombreField]}</span>
        );
    }

    render() {
        const { fieldName, multiselect, clearable, disabled } = this.props;
        const { pk, changedUrl, value, pkField, nombreField, searching } = this.state;
        const hasButton = this.props.CreateComponent || this.props.DetailComponent;
        return (
            <Row className="async-seeker-container">
                <Input
                    onChange={this.onInputChange}
                    name={fieldName}
                    value={pk ? pk : ''}
                    className="d-none uns-not-set"
                    type={multiselect ? 'text' : 'number'}
                />
                <div
                    className={hasButton ? 'col-11 pr-0' : 'col-12'}
                    style={hasButton ? { maxWidth: "calc(100% - 50px)" } : {}}
                >
                    {!changedUrl &&
                        <Async
                            clearable={clearable}
                            ref={input => { this.autoFocusInput = input }}
                            multi={multiselect}
                            backspaceRemoves={true}
                            value={(searching ? null : value)}
                            onChange={this.onSelectChange}
                            onClose={this.onMenuClosed}
                            disabled={disabled}
                            valueKey={pkField}
                            labelKey={nombreField}
                            loadOptions={this.loadOptions}
                            loadingPlaceholder={this.props.loadingPlaceholder || 'Cargando...'}
                            placeholder={this.props.placeholder || 'Seleccionar...'}
                            searchPromptText={this.props.searchPromptText || 'Escribe para buscar...'}
                            optionRenderer={this.renderOption}
                        />
                    }
                </div>
                {
                    hasButton &&
                    <div
                        className="col-1 pl-0"
                        style={{ minWidth: 50 }}
                    >
                        {
                            this.props.CreateComponent ?
                                <this.props.CreateComponent
                                    buttonClass="w-100 px-1 btn-light"
                                    onSubmit={this.created}
                                /> :

                                this.props.DetailComponent ?
                                    <this.props.DetailComponent
                                        buttonClass="w-100 px-1 btn-light"
                                        id={pk}
                                    /> : null
                        }
                    </div>

                }
                <FormFeedback className={hasButton ? 'col-11 pr-0' : 'col-12'} />
            </Row>
        );
    }
}

export default UnsAsyncSeeker;