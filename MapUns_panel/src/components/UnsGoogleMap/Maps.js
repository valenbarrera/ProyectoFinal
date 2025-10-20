import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Maps.scss";


const createCustomIcon = (color = "#007bff") =>
  new L.DivIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
      </svg>
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

export default class Maps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: props.markers || [],
      center: props.center || { lat: -38.7183, lng: -62.2663 },
      zoom: 6,
    };
  }

  static propTypes = {
    markers: PropTypes.array,
    center: PropTypes.any,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.markers !== this.props.markers) {
      this.setState({ markers: nextProps.markers });
    }
    if (nextProps.center !== this.props.center && nextProps.center) {
      this.setState({ center: nextProps.center });
    }
  }

  render() {
    const { markers, center, zoom } = this.state;

    return (
      <Map center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();

            let sizeClass = "small";
            if (count >= 50) sizeClass = "large";
            else if (count >= 10) sizeClass = "medium";

            return L.divIcon({
              html: `<div class="custom-cluster-icon custom-cluster-${sizeClass}">${count}</div>`,
              className: "leaflet-cluster-icon-wrapper",
              iconSize: L.point(40, 40, true),
            });
          }}
        >
          {markers.map((mk, i) => (
            <Marker
              key={i}
              position={mk.position}
              icon={createCustomIcon(mk.color)}
            >
              <Popup>
                <div style={{ minWidth: "250px" }}>
                  <h4>{mk.nombre} {mk.apellido}</h4>
                  <p><b>Domicilio:</b> {mk.domicilio}</p>
                  <p><b>Carrera:</b> {mk.carrera}</p>
                  {mk.telefono && <p><b>Tel:</b> {mk.telefono}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </Map>
    );
  }
}
