import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import ParadigmaDatePicker from '../../components/ParadigmaDatePicker/ParadigmaDatePicker';
import moment from 'moment';

import './DateFilter.css';
import './NumericFilter.css';

class DateFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lookup: props.datetime ? 'date__gt' : 'gt',
            date: '',
            isOpen: false
        }
    }

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        filter: PropTypes.object,
        datetime: PropTypes.bool
    }

    onChange = () => {
        const { date, lookup } = this.state;
        const { onChange, filter, datetime } = this.props;

        if (date && moment(date).isValid()) {
            onChange({
                input: moment(date).format('YYYY-MM-DD'),
                lookup: lookup
            });
        } else {
            if (filter && filter.value && filter.value.input !== '1970-1-1') {
                onChange({
                    input: '1970-1-1',
                    lookup: datetime ? 'date__gt' : 'gt'
                });
            }
        }
    }

    handleDateChange = date => {
        this.setState(
            () => ({ date }),
            this.onChange
        );
    }

    handleLookupChange = value => {
        this.setState(
            () => ({ lookup: value, isOpen: false }),
            this.onChange
        );
    }

    togglePopover = () => this.setState( prevState => ({ isOpen: !prevState.isOpen }) );

    guid = prefix => {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        // return 'tooltip-' + s4() + s4();
        return `${prefix}-${s4()+s4()}`;
    }

    reset = () => {
        this.setState(
            () => ({ date: '' }),
            this.onChange
        );

    };

    id = this.guid('tooltip');
    container = this.guid('date-filter');

    render() {
        const { isOpen } = this.state;
        const { datetime } = this.props;
        const options = [
            { value: datetime ? 'date' : 'exact', label: 'Igual a', icon: 'fa-equal'},
            { value: datetime ? 'date__gt' : 'gt', label: 'Después de', icon: 'fa-caret-right'},
            { value: datetime ? 'date__lt' : 'lt', label: 'Antes de', icon: 'fa-caret-left'} 
        ];
        const selectedOption = options.find(opt => opt.value === this.state.lookup);

        const id = this.id;

        return (
            <div className={'date-filter' + (!!this.state.date && moment(this.state.date).isValid() ? ' has-value' : '' ) + ' ' + this.container}>
                <ParadigmaDatePicker
                    value={this.state.date}
                    onChange={this.handleDateChange}
                />
                <div className="date-filter__buttons">
                    <button
                        className="date-filter__button date-filter__button-close"
                        onClick={this.reset}
                    >
                        <i className={'fa fa-close-custom'}></i>
                        
                    </button>
                    <button
                        id={id}
                        className="date-filter__button"
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
                    target={id}
                    toggle={this.togglePopover}
                    className="date-filter"
                    container={'.' + this.container}
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
                                    className={'date-filter__item' + (this.state.lookup === elem.value ? ' date-filter__item--active' : '')}
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

export default DateFilter;