import React from 'react';
import PropTypes from 'prop-types';

export default class Marker extends React.Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.map !== prevProps.map ||
      this.props.position !== prevProps.position
    ) {
      this.renderMarker();
    }
  }

  renderMarker() {
    console.log('marker?');
    let { map, google, position, mapCenter } = this.props;
    const pos = position || mapCenter;
    position = new google.maps.LatLng(pos.lat, pos.lng);
    const pref = {
      map,
      position,
    };
    this.marker = new google.maps.Marker(pref);
  }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  render() {
    return null;
  }
}
Marker.propTypes = {
  position: PropTypes.object,
  map: PropTypes.object,
};
