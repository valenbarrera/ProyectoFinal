
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withScriptjs, withGoogleMap, InfoWindow, GoogleMap, Marker, DirectionsRenderer } from "react-google-maps"

import Maps from './Maps.js'


const MapComponent = withGoogleMap((props) =>
    <Maps props={props} center={props.center} markers={props.markers} />
)

class ParadigmaGoogleMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static propTypes = {
        markers: PropTypes.array,
        center: PropTypes.any,
    }
    render() {
        return <MapComponent
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAsT1m6bBdumM-VbrP6kFWbtErVLpPgXQ8&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%`, width: '100%' }} />}
            containerElement={<div style={{ height: '100vh', width: '100%', maxHeight: 'calc(100vh - 90px)' }} />}
            mapElement={<div style={{ height: `100%`, width: '100%' }} />}
            markers={this.props.markers}
            center={this.props.center}
        />
    }
}


module.exports = ParadigmaGoogleMap;