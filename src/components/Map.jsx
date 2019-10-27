import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const style = {
    width: '100vw',
    height: '100vh'
}

export default class Map extends React.Component {

    constructor(props) {
        super(props);

        const { lat, lng } = this.props.initialCenter;
        this.state = {
            currentLocation: {
                lat: lat,
                lng: lng
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentLocation.lng) {
            console.log(nextProps.currentLocation)
            this.setState({ currentLocation: nextProps.currentLocation })
        }

    }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.google !== this.props.google) {
            this.loadMap();
        }
        if (prevState.currentLocation !== this.state.currentLocation) {
            console.log("something changed");
            this.recenterMap();

        }
    }



    recenterMap() {
        const map = this.map;
        const curr = this.state.currentLocation;

        const google = this.props.google;
        const maps = google.maps;

        if (map) {
            let center = new maps.LatLng(curr.lat, curr.lng)
            map.panTo(center)
        }
    }



    componentDidMount() {
        if (this.props.centerAroundCurrentLocation) {
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const coords = pos.coords;
                    this.setState({
                        currentLocation: {
                            lat: coords.latitude,
                            lng: coords.longitude
                        }
                    })
                })
            }
        }
        this.loadMap();

    }

    loadMap() {
        if (this.props && this.props.google) {
            // google is available
            const { google } = this.props;
            const maps = google.maps;

            const mapRef = this.refs.map;
            const node = ReactDOM.findDOMNode(mapRef);

            let { initialCenter, zoom } = this.props;
            const { lat, lng } = initialCenter;
            const center = new maps.LatLng(lat, lng);
            const mapConfig = Object.assign({}, {
                center: center,
                zoom: zoom

            })

            this.map = new maps.Map(node, mapConfig);

            let centerChangedTimeout;

            this.map.addListener('dragend', (evt) => {
                if (centerChangedTimeout) {
                    clearTimeout(centerChangedTimeout);
                    centerChangedTimeout = null;
                }
                centerChangedTimeout = setTimeout(() => {
                    this.props.onMove(this.map);
                }, 0);
            })


        }
        // ...

    }

    renderChildren() {
        console.log('rendering children');
        const { children } = this.props;

        if (!children) return;

        return React.Children.map(children, c => {
            return React.cloneElement(c, {
                map: this.map,
                google: this.props.google,
                mapCenter: this.state.currentLocation
            });
        })
    }

    render() {
        return (
            <div style={style} ref='map'>
                {this.renderChildren()}
            </div>
        )
    }
}

Map.propTypes = {
    google: PropTypes.object,
    zoom: PropTypes.number,
    initialCenter: PropTypes.object,
    onMove: PropTypes.func
}

Map.defaultProps = {
    zoom: 13,
    // San Francisco, by default
    initialCenter: {
        lat: 37.774929,
        lng: -122.419416
    },
    centerAroundCurrentLocation: true,
    onMove: function () { }
}
