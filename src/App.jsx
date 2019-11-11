import React from "react";


import { GoogleApiWrapper } from 'google-maps-react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Example from "./components/UploadModal.jsx"
import Map from "./components/Map.jsx"
import Marker from "./components/Marker.jsx"



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
      },
      isModalShown: true

    };
    this.target = React.createRef();


  }




  handlePositions = (updateLatitude, updateLongitude) => {
    console.log('in parent', updateLatitude, updateLongitude)
    this.setState({
      location: {
        lat: updateLatitude,
        lng: updateLongitude
      },
      isModalShown: false
    })

  }



  render() {

    return (

      <div>

        <div ref={this.target}>
          {this.state.isModalShown ? (

            <Example google={this.props.google} onComplete={this.handlePositions} handleClose={() => { console.log("set new state"); this.setState({ isModalShown: false }) }} />
          ) : (
              <div>

                <Overlay target={this.target.current} show={true} placement="bottom">
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
                        <Button variant="primary" onClick={() => this.setState({ isModalShown: true })}>Try Again!</Button>
                      </div>
                    )}
                </Overlay>


              </div>
            )}

        </div>

        <div style={style}>
          <Map google={this.props.google} currentLocation={this.state.location} >
            <Marker position={this.state.location} />
            <Marker />
          </Map>

        </div>



      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_MAPS_JS_API_KEY
})(App);