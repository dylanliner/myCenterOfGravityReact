import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const style = {
  width: '100vw',
  height: '100vh',
};

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    const { initialCenter } = this.props;
    const { lat, lng } = initialCenter;
    this.state = {
      currentLocation: {
        lat,
        lng,
      },
    };
  }

  componentDidMount() {
    const { centerAroundCurrentLocation } = this.props;

    if (centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { coords } = pos;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude,
            },
          });
        });
      }
    }
    this.loadMap();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentLocation.lng) {
      console.log(nextProps.currentLocation);
      this.setState({ currentLocation: nextProps.currentLocation });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { google } = this.props;
    const { currentLocation } = this.state;
    if (prevProps.google !== google) {
      this.loadMap();
    }
    if (prevState.currentLocation !== currentLocation) {
      console.log('something changed');
      this.recenterMap();
    }
  }

  recenterMap() {
    const { map } = this;
    const { currentLocation } = this.state;

    const { google } = this.props;
    const { maps } = google;

    if (map) {
      const center = new maps.LatLng(currentLocation.lat, currentLocation.lng);
      map.panTo(center);
    }
  }

  loadMap() {
    const { google, onMove } = this.props;
    if (this.props && google) {
      // google is available
      const { maps } = google;
      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);
      const { initialCenter, zoom } = this.props;
      const { lat, lng } = initialCenter;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = {
        center,
        zoom,
      };

      this.map = new maps.Map(node, mapConfig);

      let centerChangedTimeout;

      this.map.addListener('dragend', () => {
        if (centerChangedTimeout) {
          clearTimeout(centerChangedTimeout);
          centerChangedTimeout = null;
        }
        centerChangedTimeout = setTimeout(() => {
          onMove(this.map);
        }, 0);
      });
    }
    // ...
  }

  renderChildren() {
    console.log('rendering children');
    const { children, google } = this.props;
    const { currentLocation } = this.props;
    if (!children) return;

    return React.Children.map(children, c =>
      React.cloneElement(c, {
        map: this.map,
        google,
        mapCenter: currentLocation,
      })
    );
  }

  render() {
    return (
      <div style={style} ref="map">
        {this.renderChildren()}
      </div>
    );
  }
}

Map.propTypes = {
  google: PropTypes.object,
  zoom: PropTypes.number,
  centerAroundCurrentLocation: PropTypes.bool,
  initialCenter: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onMove: PropTypes.func,
  currentLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

Map.defaultProps = {
  zoom: 13,
  // San Francisco, by default
  initialCenter: {
    lat: 37.774929,
    lng: -122.419416,
  },
  centerAroundCurrentLocation: true,
  currentLocation: {
    lat: 37.774929,
    lng: -122.419416,
  },
  onMove() {},
};
