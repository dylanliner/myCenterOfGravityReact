import React from 'react';

import PropTypes from 'prop-types';
import { GoogleApiWrapper } from 'google-maps-react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Example from './components/UploadModal';
import Map from './components/Map';
import Marker from './components/Marker';

const style = {
  width: '100vw',
  height: '100vh',
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {
        lat: null,
        lng: null,
      },
      isModalShown: true,
    };
    this.target = React.createRef();
  }

  componentDidMount() {
    const { centerAroundCurrentLocation } = this.props;
    if (centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { coords } = pos;
          this.setState({
            location: {
              lat: coords.latitude,
              lng: coords.longitude,
            },
          });
        });
      }
    }
  }

  handleClose = () => {
    this.setState({ isModalShown: false });
  };

  handlePositions = (updateLatitude, updateLongitude) => {
    this.setState({
      location: {
        lat: updateLatitude,
        lng: updateLongitude,
      },
      isModalShown: false,
    });
  };

  render() {
    const { isModalShown, location } = this.state;
    const { google } = this.props;
    return (
      <div>
        <div ref={this.target}>
          {isModalShown ? (
            <Example
              onComplete={this.handlePositions}
              handleClose={this.handleClose}
            />
          ) : (
            <div>
              <Overlay target={this.target.current} show placement="bottom">
                {({
                  placement,
                  scheduleUpdate,
                  arrowProps,
                  outOfBoundaries,
                  show: _show,

                  ...props
                }) => (
                  <div
                    {...props}
                    style={{
                      background: 'none',
                      ...props.style,
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => this.setState({ isModalShown: true })}
                    >
                      Try Again!
                    </Button>
                  </div>
                )}
              </Overlay>
            </div>
          )}
        </div>

        <div style={style}>
          <Map google={google} currentLocation={location}>
            <Marker position={location} />
            <Marker />
          </Map>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_MAPS_JS_API_KEY,
})(App);

App.propTypes = {
  google: PropTypes.object.isRequired,
  centerAroundCurrentLocation: PropTypes.bool,
};

App.defaultProps = {
  centerAroundCurrentLocation: true,
};
