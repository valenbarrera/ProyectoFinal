import React, { Component, Fragment } from 'react';
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';

import './NumericFilter.css';

/**
 * Para implentarse, en el array de columnas que se envía al componente ParadigmaTable,
 * en la propiedad Filter del objeto (que debe ser numérico) se pasa una función:
 * Filter: ({ filter, onChange }) => <NumericFilter filter={filter} onChange={onChange} />
 */
class NumericFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lookup: 'gt',
            input: 0,
            isOpen: false
        }
    }
 
    handleInputChange = e => {
        e.persist();
        const { value } = e.target;
        const isValid = /^[0-9]{1,}\.?[0-9]*$/.test(value);
        this.setState(
            prevState => {
                return { input: isValid ? value : prevState.input };
            },
            () => {
                if (isValid) this.onChange();
            }
            
        );
    }

    onChange = () => {
        const { lookup, input } = this.state;
        const isValid = /^[0-9]{1,}\.?[0-9]*$/.test(input);
        if (isValid) {
            this.props.onChange({ lookup, input });
        }
    }

    handleLookupChange = newVal => this.setState(_ => ({ lookup: newVal }), this.onChange);

    togglePopover = () => this.setState( prevState => ({ isOpen: !prevState.isOpen }) );

    reset = () => this.setState(() => ({ input: 0, lookup: 'gt' }), this.onChange);

    guid = prefix => {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return `${prefix}-${s4()}${s4()}`;
    }

    id = this.guid('tooltip');
    container = this.guid('numeric-filter');

    render() {
        const { onChange } = this.props;
        const { isOpen } = this.state;
        const options = [
            { value: 'exact', label: 'Igual a', icon: 'fa-equal'},
            { value: 'gt', label: 'Mayor que', icon: 'fa-caret-right'},
            { value: 'lt', label: 'Menor que', icon: 'fa-caret-left'} 
        ];

        const selectedOption = options.find(opt => opt.value === this.state.lookup);
        return (
            <div className={"numeric-filter has-value " + this.container}>
                <input
                    type="text"
                    name="input"
                    className="numeric-filter__input w-100 text-right"
                    onChange={this.handleInputChange}
                    value={this.state.input}
                />
                        <button
                            className="numeric-filter__button numeric-filter__button-close"
                            onClick={this.reset}
                        >
                            <i className={'fa fa-close-custom'}></i>
                        </button>
                        <div className="numeric-filter__buttons">

                            <button
                                id={this.id}
                                className="numeric-filter__button"
                                onClick={this.togglePopover}
                            >
                                {
                                    selectedOption ?
                                    <i className={'fa ' + selectedOption.icon}></i> :
                                    <i className="fa fa-filter"></i>
                                }
                                
                            </button>
                        </div>
                        <Popover
                            placement="bottom"
                            isOpen={isOpen}
                            target={this.id}
                            toggle={this.togglePopover}
                            className="numeric-filter"
                            container={'.' + this.container}
                            style={{
                                width: '100%',
                                transform: 'none',
                                left: '0',
                                top: '20px'
                            }}
                        >
                            <PopoverHeader>
                                <i className="fa fa-filter"></i> Filtro
                            </PopoverHeader>
                            <PopoverBody
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <ul style={{ padding: 0, margin: 0 }}>
                                {
                                    options.map((elem, i) => 

                                        <li
                                            key={elem.value}
                                            className={'numeric-filter__item' + (this.state.lookup === elem.value ? ' numeric-filter__item--active' : '')}
                                            onClick={() => this.handleLookupChange(elem.value)}
                                        >
                                            <i className={'fa ' + elem.icon}></i> {elem.label}
                                        </li>
                                    )
                                }
                                </ul>
                            </PopoverBody>
                        </Popover>

            </div>
        );
    }
}

export default NumericFilter;