import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  GoogleMap,
  Marker,
  InfoWindow,
} from "react-google-maps";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";

class Maps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: props.markers || [],
      mapProps: this.parseMarkers(props.markers || [], props.center),
      center: props.center,
    };
  }

  static propTypes = {
    markers: PropTypes.array,
    center: PropTypes.any,
  };

  componentWillReceiveProps(nextProps) {
    let mapProps = this.state.mapProps;
    let markers = this.state.markers;
    let center = this.state.center;
    if (nextProps.center !== this.props.center) {
      center = nextProps.center;
    }
    if (nextProps.markers !== this.props.markers) {
      markers = nextProps.markers;
      mapProps = this.parseMarkers(nextProps.markers, center);
    }
    this.setState({ markers, mapProps, center });
  }

  parseMarkers(markers, center) {
    if (!markers.length)
      return {
        zoom: 12,
        centerLat: -38.7183177,
        centerLng: -62.2663478,
      };

    let maxLat = -90,
      minLat = 90,
      maxLng = -180,
      minLng = 180;
    markers.forEach((m) => {
      maxLat = Math.max(maxLat, m.position.lat);
      minLat = Math.min(minLat, m.position.lat);
      maxLng = Math.max(maxLng, m.position.lng);
      minLng = Math.min(minLng, m.position.lng);
    });
    const centerLat = (maxLat + minLat) / 2;
    const centerLng = (maxLng + minLng) / 2;
    const sizeLat = Math.abs(maxLat - minLat);
    const sizeLng = Math.abs(maxLng - minLng);
    const zoom =
      Math.floor(
        Math.log(Math.sqrt(sizeLat ** 2 + sizeLng ** 2)) * -1.5 + 10
      ) || 5;

    return {
      zoom: Math.min(zoom, 17),
      centerLat,
      centerLng,
    };
  }

  onToggleOpen(idx) {
    const markers = this.state.markers.map((m, i) => ({
      ...m,
      isOpen: i === idx ? !m.isOpen : false,
    }));
    this.setState({ markers });
  }

  render() {
    const { mapProps, markers } = this.state;

    return (
      <GoogleMap
        ref={(map) => (this.map = map)}
        defaultZoom={mapProps.zoom}
        zoom={mapProps.zoom}
        defaultCenter={{
          lat: mapProps.centerLat,
          lng: mapProps.centerLng,
        }}
        center={{
          lat: mapProps.centerLat,
          lng: mapProps.centerLng,
        }}
      >
        {/* 👉 Cluster compatible con react-google-maps 9 */}
        <MarkerClusterer
          averageCenter
          enableRetinaIcons
          gridSize={40}
          imagePath="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
        >
          {markers.map((mk, i) => {
            const Component = mk.Component;
            return (
              <Marker
                key={i}
                position={mk.position}
                onClick={() => this.onToggleOpen(i)}
                icon={
                  mk.color
                    ? {
                        path: "m256.000002,3c-43.351135,0 -78.500002,35.141016 -78.500002,78.500002c0,12.142969 2.759766,23.657447 7.689075,33.914454c0.275731,0.582863 70.810927,138.78555 70.810927,138.78555l69.960183,-137.068362c5.458203,-10.686303 8.539819,-22.798854 8.539819,-35.631641c0,-43.358985 -35.141016,-78.500002 -78.500002,-78.500002zm0,125.600003c-26.010976,0 -47.100001,-21.096875 -47.100001,-47.100001s21.089025,-47.100001 47.100001,-47.100001c26.003126,0 47.100001,21.096875 47.100001,47.100001s-21.096875,47.100001 -47.100001,47.100001z",
                        fillColor: mk.color,
                        fillOpacity: 1,
                        anchor: new google.maps.Point(256, 256),
                        strokeWeight: 0.5,
                        scale: 0.15,
                      }
                    : null
                }
              >
                {mk.isOpen && (
                  <InfoWindow onCloseClick={() => this.onToggleOpen(i)}>
                    <Component show={mk.isOpen} />
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        </MarkerClusterer>
      </GoogleMap>
    );
  }
}

module.exports = Maps;
