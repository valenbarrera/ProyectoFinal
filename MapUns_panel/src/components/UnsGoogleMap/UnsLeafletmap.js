import React, { Component } from "react";
import PropTypes from "prop-types";
import Maps from "./Maps.js";

class UnsLeafletMap extends Component {
  static propTypes = {
    markers: PropTypes.array,
    center: PropTypes.any,
  };

  render() {
    const { markers, center } = this.props;

    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          maxHeight: "calc(100vh - 90px)",
        }}
      >
        <Maps markers={markers} center={center} />
      </div>
    );
  }
}

export default UnsLeafletMap;
