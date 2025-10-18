import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';
import Dashboard from '../../views/Dashboard/';

import Localidades from '../../views/Locaciones/Localidades/';
import Provincias from '../../views/Locaciones/Provincias/';

import Clientes from '../../views/Clientes/';
import AlumnoDetail from '../../views/Clientes/AlumnoDetail';
import Mapa from '../../views/Clientes/Mapa.js';

import Usuarios from '../../views/Usuarios/Usuarios/';
import Permisos from '../../views/Usuarios/Permisos/';
import Grupos from '../../views/Usuarios/Grupos/';


class Full extends Component {
  render() {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar {...this.props}/>
          <main className="main">
            <Container fluid>
              <Switch>
                <Route path="/usuarios/usuarios" name="Usuarios" component={Usuarios}/>
                <Route path="/usuarios/permisos" name="Permisos" component={Permisos}/>
                <Route path="/usuarios/grupos" name="Grupos" component={Grupos}/>

                <Route path="/configuracion/geo/localidades" name="Localidades" component={Localidades}/>
                <Route path="/configuracion/geo/provincias" name="Provincias" component={Provincias}/>
                
                <Route exact path="/alumnos" name="Alumnos" component={Clientes}/>
                <Route path="/alumnos/:id" name="Alumno" component={AlumnoDetail}/>
                <Route path="/mapa" name="Mapa" component={Mapa}/>


                <Redirect from="/" to="/mapa"/>
              </Switch>
            </Container>
          </main>
        </div>
        
      </div>
    );
  }
}

export default Full;
