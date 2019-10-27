import React from "react";


import { GoogleApiWrapper } from 'google-maps-react';

import Example from "./components/UploadModal.js"
import Map from "./components/Map.jsx"
import Marker from "./components/Marker.jsx"


const APIKey = process.env.REACT_APP_MAPS_JS_API_KEY;

const style = {
  width: '100vw',
  height: '100vh'
}



class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      location: {
        lat: null,
        lng: null,
      }

    };

  }


  handlePositions = (updateLatitude, updateLongitude) => {
    console.log('in parent', updateLatitude, updateLongitude)
    this.setState({
      location: {
        lat: updateLatitude,
        lng: updateLongitude
      }
    })
    console.log('in parent', this.state.location)
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

        <div style={style}>
          <Map google={this.props.google} currentLocation={this.state.location} >
            <Marker position={this.state.location} />
            <Marker />
          </Map>

        </div>


        <div>
          <Example onComplete={this.handlePositions} />

        </div>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: APIKey
})(App);