import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Input, Row, Col, FormFeedback, Label } from 'reactstrap';

import { withScriptjs, withGoogleMap, InfoWindow, GoogleMap, FusionTablesLayer, TrafficLayer, Marker, DirectionsRenderer, Icon } from "react-google-maps"
import HeatmapLayer from "react-google-maps/lib/components/visualization/HeatmapLayer";

class Maps extends Component {
	constructor(props) {
		super(props);
		this.state = {
			markers: this.props.markers,
			mapProps: this.parseMarkers(this.props.markers, this.props.center),
			colors: ['blue', 'red', 'green', 'yellow', 'pink', 'black'],
			center: this.props.center,
		};
	}

	static propTypes = {
		markers: PropTypes.array,
		center: PropTypes.any,
	}

	componentWillReceiveProps(nextProps) {
		var mapProps = this.props.mapProps;
		var markers = this.props.markers;
		var center = this.props.center;
		if (nextProps.center != this.props.center) {
			center = nextProps.center;
		}
		if (nextProps.markers != this.props.markers) {
			markers = nextProps.markers;
			mapProps = this.parseMarkers(nextProps.markers, center);
		}
		this.setState({ markers: markers, mapProps: mapProps, center: center });
	}

	geometryToComponentWithLatLng(geometry) {
		const typeFromThis = Array.isArray(geometry);
		const type = typeFromThis ? this.type : geometry.type;
		let coordinates = typeFromThis ? geometry : geometry.coordinates;

		switch (type) {
			case 'Polygon':
				return {
					ElementClass: Polygon,
					paths: coordinates.map(
						geometryToComponentWithLatLng, {
							type: 'LineString'
						}
					)[0],
				};
			case 'LineString':
				coordinates = coordinates.map(
					geometryToComponentWithLatLng, {
						type: 'Point'
					}
				);
				return typeFromThis ? coordinates : {
					ElementClass: Polyline,
					path: coordinates,
				};
			case 'Point':
				coordinates = {
					lat: coordinates[1],
					lng: coordinates[0]
				}
				return typeFromThis ? coordinates : {
					ElementClass: Marker,
					ChildElementClass: InfoWindow,
					position: coordinates,
				};
			default:
				throw new TypeError('Unknown geometry type: ${ type }');
		}
	}

	parseMarkers(markers, center) {
		if (markers.length > 0) {
			var v = [];
			var maxLat = 0, minLat = 0, maxLng = 0, minLng = 0, centerLat = 0, centerLng = 0, stdLat = 0, stdLng = 0;
			for (let i = 0; i < markers.length; i++) {
				let datos = markers[i];
				centerLat += datos.position.lat;
				centerLng += datos.position.lng;

				if (center) {
					stdLat = Math.pow(center.lat - datos.position.lat, 2);
					stdLng = Math.pow(center.lng - datos.position.lng, 2);
				}

				if (stdLat < .01 && stdLng < .01) {
					if (maxLat < datos.position.lat | maxLat == 0) maxLat = datos.position.lat;
					if (minLat > datos.position.lat | minLat == 0) minLat = datos.position.lat;
					if (maxLng < datos.position.lng | maxLng == 0) maxLng = datos.position.lng;
					if (minLng > datos.position.lng | minLng == 0) minLng = datos.position.lng;
				}
			}
			centerLat = centerLat / markers.length;
			centerLng = centerLng / markers.length;
			var SizeLat = Math.abs(maxLat - minLat);
			var SizeLng = Math.abs(maxLng - minLng);
			var Zoom = Math.floor(Math.log(Math.sqrt(Math.pow(SizeLat, 2) + Math.pow(SizeLng, 2))) * -1.5 + 10);

			centerLat = (maxLat - minLat) / 2 + minLat;
			centerLng = (maxLng - minLng) / 2 + minLng;

			/*if (center) {
				centerLat = center.lat;
				centerLng = center.lng;
				Zoom = 13;
			}*/

			//esto lo genere haciendo una regresión, sacando distancias entre markers y el zoom que necesitaba para verlo
			if (Zoom > 17) Zoom = 17;
			return {
				zoom: Zoom,
				centerLat: centerLat,
				centerLng: centerLng,
			};
		} else
			return {
				zoom: 12,
				centerLat: -38.7183177,
				centerLng: -62.2663478,
			};
	}

	centerChanged() {
		var center = this.map.getCenter();
		var lat = center.lat();
		var lng = center.lng();
		if (lat != this.state.mapProps.centerLat || lng != this.state.mapProps.centerLng) {
			var mapProps = this.state.mapProps;
			mapProps.centerLat = lat;
			mapProps.centerLng = lng;
			this.setState({ mapProps: mapProps });
		}
	}

	zoomChanged() {
		var zoom = this.map.getZoom();
		if (zoom != this.state.mapProps.zoom) {
			var mapProps = this.state.mapProps;
			mapProps.zoom = zoom;
			this.setState({ mapProps: mapProps });
		}
	}

	onToggleOpen(idx) {
		var markers = this.state.markers;
		markers.forEach((x, i) => { if (i != idx) x.isOpen = false });
		markers[idx].isOpen = !markers[idx].isOpen;
		this.setState({ markers: markers });
	}

	render() {
		var drawMarkers = [];
		for (let i = 0; i < this.state.markers.length; i++) {
			let mk = this.state.markers[i];
			let Component = mk.Component;
			drawMarkers.push(
				<Marker
					key={i} position={mk.position}
					options={{ polylineOptions: { strokeColor: mk.color } }}
					defaultIcon={(mk.color ? {
						path: "m256.000002,3c-43.351135,0 -78.500002,35.141016 -78.500002,78.500002c0,12.142969 2.759766,23.657447 7.689075,33.914454c0.275731,0.582863 70.810927,138.78555 70.810927,138.78555l69.960183,-137.068362c5.458203,-10.686303 8.539819,-22.798854 8.539819,-35.631641c0,-43.358985 -35.141016,-78.500002 -78.500002,-78.500002zm0,125.600003c-26.010976,0 -47.100001,-21.096875 -47.100001,-47.100001s21.089025,-47.100001 47.100001,-47.100001c26.003126,0 47.100001,21.096875 47.100001,47.100001s-21.096875,47.100001 -47.100001,47.100001z",
						fillColor: mk.color,
						fillOpacity: 1,
						anchor: new google.maps.Point(256, 256),
						strokeWeight: 0.5,
						scale: 0.15
					} : null)}
					onClick={(e) => this.onToggleOpen(i)}
				>
					{mk.isOpen && <InfoWindow onCloseClick={(e) => this.onToggleOpen(i)}>{<Component show={mk.isOpen} />}</InfoWindow>}
				</Marker>
			);
		}

		return <GoogleMap
			ref={(map) => { this.map = map; }}
			defaultZoom={this.state.mapProps.zoom}
			zoom={this.state.mapProps.zoom}
			defaultCenter={{ lat: this.state.mapProps.centerLat, lng: this.state.mapProps.centerLng }}
			center={{ lat: this.state.mapProps.centerLat, lng: this.state.mapProps.centerLng }}
			onCenterChanged={() => this.centerChanged()}
			onZoomChanged={() => this.zoomChanged()}
		>

			{drawMarkers}
		</GoogleMap>
	}
};

module.exports = Maps;

//<HeatmapLayer data={this.state.markers.map(x => ({ location: new google.maps.LatLng(x.position.lat, x.position.lng), weight: x.weight }))} />