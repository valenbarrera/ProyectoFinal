import React, { Component } from 'react';
import {
  Container, Row, Col, CardGroup,
  Nav, NavbarBrand, Card, CardBody, Button, Input, InputGroup, InputGroupAddon, FormFeedback, FormGroup
} from 'reactstrap';
import auth from '../../../auth/'
import './styles.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  SendLogin() {
    auth.login(this.state.username, this.state.password, (response) => {
      if (response.success) {
        this.props.history.push('/');
      } else {
        this.errors.className = 'col-12 invalid-feedback px-0' + ' d-block';
        this.errors.innerHTML = response.errors["global"];
      }
    })
  }

  render() {
    return (
      <div className="app flex-row align-items-center bgimg">
        <div className="bgbackdrop"></div>
        <Container fluid>
          <Row className="justify-content-center">
            <Col md="4" className="affix">
              <CardGroup className="h-100">
                <Card className="p-4 rounded-0">
                  <CardBody className="mt-4 mb-auto">
                    <div className="logo-darsur">
                      <img />
                    </div>
                    <InputGroup className="my-3 form-row">
                      <InputGroup className="col-1"><i className="icon-user m-auto"></i></InputGroup>
                      <Input className="col-11" onKeyDown={(e) => (e.keyCode == 13 && this.state.password != '' ? this.SendLogin() : false)} onChange={(e) => this.setState({ username: e.target.value })} name="username" type="text" placeholder="Usuario" />
                      <FormFeedback className="col-12"></FormFeedback>
                    </InputGroup>
                    <InputGroup className="form-row">
                      <InputGroup className="col-1"><i className="icon-lock m-auto"></i></InputGroup>
                      <Input className="col-11" onKeyDown={(e) => (e.keyCode == 13 && this.state.username != '' ? this.SendLogin() : false)} onChange={(e) => this.setState({ password: e.target.value })} name="password" type="password" placeholder="Contraseña" />
                      <FormFeedback className="col-12"></FormFeedback>
                    </InputGroup>
                    <Row>
                      <Col>
                        <div ref={(input) => { this.errors = input; }} className="col-12 invalid-feedback px-0"></div>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3">
                        <Button onClick={(e) => this.SendLogin()} color="primary" className="px-4 float-right">Ingresar</Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </CardGroup>

              <footer>
                <a href="http://www.paradigma.com.ar/" className="logoParadigma"></a>
                <h6>{new Date().getFullYear()} © Paradigma del Sur S.A. Todos los derechos reservados.</h6></footer>
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}

export default Login;
