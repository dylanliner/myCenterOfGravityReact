import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import React from "react";
import { useDropzone } from 'react-dropzone';
import oboe from 'oboe';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Geocode from "react-geocode";


function Example({ onComplete, handleClose }) {

    const [percentLoaded, setPercentLoaded] = React.useState(0);
    const [city, setCity] = React.useState("");
    const [excludedCity, setExcludedCity] = React.useState("");
    const [excludedCityRadius, setExcludedCityRadius] = React.useState(3);
    const [radius, setRadius] = React.useState(10);


    const maxSize = 204857600;

    Geocode.setApiKey(process.env.REACT_APP_MAPS_JS_API_KEY);

    async function findGeoCodeFromAddress(address) {
        let response = await Geocode.fromAddress(address)
        let data = response.results[0].geometry.location;
        return data;
    }




    const onDrop = React.useCallback(async (acceptedFiles) => {

        console.log("the city is", city, "radius is", radius);
        let centerPoint = null;
        let centerPointToExclude = null;

        //If a city and/or and excluded city was provided, get coordinates
        if (city) {
            centerPoint = await findGeoCodeFromAddress(city)
            console.log(centerPoint)
        };
        console.log(centerPoint)

        if (excludedCity) {
            centerPointToExclude = await findGeoCodeFromAddress(excludedCity)
            console.log(centerPointToExclude)
        };
        console.log(centerPoint)


        const startTime = new Date().getTime();
        const acceptedFile = acceptedFiles[0];
        let centerOfGravityLatitude = 0
        let centerOfGravityLongitude = 0
        let latitudeSum = 0;
        let longitudeSum = 0;
        let positionCount = 0;
        let isLocationWithinDistance = true;
        let isNotWithinDistance = true;
        var os = new oboe();
        os.node('locations.*', function (location) {

            if (centerPoint) {
                isLocationWithinDistance = checkIfWithinDistance(location, centerPoint, radius)
            }

            if (centerPointToExclude) {
                isNotWithinDistance = !checkIfWithinDistance(location, centerPointToExclude, excludedCityRadius)
            }

            if (isLocationWithinDistance && isNotWithinDistance) {
                latitudeSum += location.latitudeE7;

                longitudeSum += location.longitudeE7
                ++positionCount;
            }
        }).done(function () {
            console.log('position count' + positionCount)
            centerOfGravityLatitude = latitudeSum / positionCount / 10000000;
            centerOfGravityLongitude = longitudeSum / positionCount / 10000000;
            console.log('Average Latitude ' + centerOfGravityLatitude)
            console.log('Average Longitude ' + centerOfGravityLongitude)
            onComplete(centerOfGravityLatitude, centerOfGravityLongitude)
            const endTime = new Date().getTime();
            console.log((endTime - startTime) / 1000 + " seconds");
            handleClose();
        });
        parseFile(acceptedFile, os);

    }, [city, radius, excludedCity, excludedCityRadius]
    );




    function checkIfWithinDistance(testLocation, centerPoint, distanceToCenter) {

        var ky = 40000 / 360;
        var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
        var dx = Math.abs(centerPoint.lng - testLocation.longitudeE7 / 10000000) * kx;
        var dy = Math.abs(centerPoint.lat - testLocation.latitudeE7 / 10000000) * ky;
        return Math.sqrt(dx * dx + dy * dy) <= distanceToCenter;
    }

    function parseFile(file, oboe) {
        var fileSize = file.size;
        var chunkSize = 64 * 1024; // bytes
        var offset = 0;
        var chunkReaderBlock = null;



        var readEventHandler = function (evt) {
            if (evt.target.error == null) {
                offset += evt.target.result.length;
                setPercentLoaded((100 * offset / fileSize).toFixed(0));
                oboe.emit('data', evt.target.result); // callback for handling read chunk
            } else {
                console.log("Read error: " + evt.target.error);
                return;
            }
            if (offset >= fileSize) {
                console.log("Done reading file");

                return;
            }

            // of to the next chunk
            chunkReaderBlock(offset, chunkSize, file);
        }

        chunkReaderBlock = function (_offset, length, _file) {
            var r = new FileReader();
            var blob = _file.slice(_offset, length + _offset);
            r.onload = readEventHandler;
            r.readAsText(blob);
        }

        // now let's start the read with the first block
        chunkReaderBlock(offset, chunkSize, file);
    }


    const { isDragActive, getRootProps, getInputProps, isDragReject, acceptedFiles, rejectedFiles } = useDropzone({
        onDrop,
        accept: 'application/json',
        minSize: 0,
        maxSize,
    });

    const isFileTooLarge = rejectedFiles.length > 0 && rejectedFiles[0].size > maxSize;



    return (

        <>

            <Modal show={true} onHide={handleClose} >
                <Modal.Header closeButton >
                    <Modal.Title>What's my center of Gravity?</Modal.Title>

                </Modal.Header>
                <Modal.Body>
                    <Accordion>
                        <Card style={{ border: "none" }}>
                            <Card.Header style={{ background: "none", borderBottom: "none" }}>
                                <Accordion.Toggle className="text-center" as={Button} variant="link" eventKey="0">
                                    Look for your average location in a specific area
      </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body style={{ padding: "0", paddingTop: "15px" }}>
                                    <div>


                                        <Row>


                                            <div style={{ paddingLeft: "15px" }}>Search for your average location around a city</div>
                                        </Row>
                                        <Row>

                                            <Col xs={7}>

                                                <InputGroup className="mb-3">
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text id="basic-addon1">City</InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <FormControl
                                                        type="text"
                                                        value={city}

                                                        onChange={e => { setCity(e.target.value) }}
                                                        placeholder="Paris"
                                                        aria-label="City or address"
                                                        aria-describedby="basic-addon1"
                                                    />
                                                </InputGroup>

                                            </Col>

                                            <Col>

                                                <InputGroup className="mb-3" >
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text>Radius</InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <FormControl aria-label="Radius in Km" value={radius}
                                                        onChange={e => setRadius(e.target.value)} />
                                                    <InputGroup.Append>
                                                        <InputGroup.Text>Km</InputGroup.Text>
                                                    </InputGroup.Append>
                                                </InputGroup>
                                            </Col>
                                        </Row>
                                        <Row>


                                            <div style={{ paddingLeft: "15px" }}>Exclude locations in an area to determine your average location</div>
                                        </Row>
                                        <Row>

                                            <Col xs={7}>

                                                <InputGroup className="mb-3">
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text id="basic-addon1">City</InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <FormControl
                                                        value={excludedCity}
                                                        onChange={e => { setExcludedCity(e.target.value) }}

                                                        placeholder="Paris"
                                                        aria-label="City or address"
                                                        aria-describedby="basic-addon1"
                                                    />
                                                </InputGroup>
                                            </Col>

                                            <Col>

                                                <InputGroup className="mb-3">
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text>Radius</InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <FormControl aria-label="Radius in Km" value={excludedCityRadius}
                                                        onChange={e => setExcludedCityRadius(e.target.value)} />
                                                    <InputGroup.Append>
                                                        <InputGroup.Text>Km</InputGroup.Text>
                                                    </InputGroup.Append>
                                                </InputGroup>
                                            </Col>
                                        </Row>

                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>

                    </Accordion>
                    < div className="container text-center mt-5" >
                        <div {...getRootProps()} >
                            <input {...getInputProps()} />
                            {!isDragActive && 'Click here or drop a file to upload!'
                            }
                            {isDragActive && !isDragReject && "Drop it like it's hot!"}
                            {isDragReject && "File type not accepted, sorry!"}
                            {
                                isFileTooLarge && (
                                    <div className="text-danger mt-2" >
                                        File is too large.
          </div>
                                )
                            }
                        </div>
                        < ul className="list-group mt-2" >
                            {
                                acceptedFiles.length > 0 && acceptedFiles.map(acceptedFile => (
                                    <li className="list-group-item list-group-item-success" >
                                        {acceptedFile.name}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <br></br>
                    <div>
                        {percentLoaded > 0 &&
                            <ProgressBar animated now={percentLoaded} label={`${percentLoaded}%`} />
                        }
                    </div>

                </Modal.Body>


            </Modal>
        </>
    );
}

export default Example;

