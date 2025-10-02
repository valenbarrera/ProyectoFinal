import React, { Component } from 'react';

import Widget04 from './Widget04.js';
import {Row, Col, Label, Input, InputGroup,FormFeedback} from 'reactstrap';

import api from '../../api'
import auth from '../../auth'
import axios from "axios";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
      stats:{
        ejemplo:{
          percent:1,
          value:1
        },
      }
    };
  }

  componentDidMount(){
    this.LoadData();
  }

  LoadData(){
    var self = this;
    axios.get(api.dashboard.stats, auth.header())
    .then(function(response){
      self.setState({stats:response.data});
    })
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    return (
      <div className="animated fadeIn dashboard">
        <div className="app flex-row align-items-center bgimg">
          <div className="justify-content-center  row">
            <div className="col col-md-7">
              <img className="col-md-12 login-group"/>
            </div>
          </div>
        </div>
        <Row className="mx-1 mt-4">
          <Col sm="6" md="2">
            <Widget04 icon="fa fa-exclamation" color="warning" header={this.state.stats.ejemplo.value.toString()} value={this.state.stats.ejemplo.percent.toString()} invert>Ejemplo</Widget04>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Dashboard;
