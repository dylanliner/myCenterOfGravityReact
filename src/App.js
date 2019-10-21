import React from "react";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";

import { Map, GoogleApiWrapper } from 'google-maps-react';

import Example from "./components/UploadModal.js"



const APIKey = process.env.REACT_APP_MAPS_JS_API_KEY;
const mapStyles = {
  width: '100%',
  height: '100%',
};




class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      longitude: 150.644,
      latitude: -34.397
    };
  }


  handlePositions = (updateLatitude, updateLongitude) => {
    console.log('in parent', updateLatitude, updateLongitude)
    this.setState({ latitude: updateLatitude });
    this.setState({ longitude: updateLongitude });
  }



  componentDidMount() {
    this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 3000)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <div>
        <div style={{ width: '100vw', height: '100vh' }}>
          <Map
            google={this.props.google}
            zoom={8}
            style={mapStyles}
            initialCenter={{ lat: this.state.latitude, lng: this.state.longitude }}
            centerAroundCurrentLocation={true}
          />


        </div>
        <Example onComplete={this.handlePositions} />

      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: APIKey
})(App);