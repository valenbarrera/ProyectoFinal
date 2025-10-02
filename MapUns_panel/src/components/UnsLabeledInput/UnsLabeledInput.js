import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Input, Row, Col, FormFeedback, Label } from 'reactstrap';

import './UnsLabeledInput.scss';

class UnsLabeledInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	static propTypes = {
		onChange: PropTypes.func,
		onExternalChange: PropTypes.func,
		label: PropTypes.string.isRequired,
		field_name: PropTypes.string,
		labelColumns: PropTypes.number.isRequired,
		fieldColumns: PropTypes.number.isRequired,
		InputComponent: PropTypes.any,
		disabled: PropTypes.bool,
		type: PropTypes.string,

		rows: PropTypes.number,
	}

	render() {
		var InputComponent = <Input
			className="input-personalizado"
			placeholder="Ingresar texto para filtrar"
			disabled={this.props.disabled}
			type={(this.props.type ? this.props.type : "text")}
			rows={this.props.rows ? this.props.rows : null}
			name={this.props.field_name}
			onChange={(e) => { if (this.props.onChange) { this.props.onChange(e); } }}
		></Input>;
		
		if (this.props.InputComponent) InputComponent = this.props.InputComponent;

		return (
			<Row className="mt-sm-1">
				<Col className={"col-12 col-sm-" + this.props.labelColumns.toString()}>
					<Label>{this.props.label}</Label>
				</Col>
				<Col className={"col-12 col-sm-" + this.props.fieldColumns.toString()}>
					{InputComponent}
					<FormFeedback className="col-12"></FormFeedback>
				</Col>
			</Row>
		);
	}
};

module.exports = UnsLabeledInput;