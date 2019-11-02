import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import React from "react";
import { useDropzone } from 'react-dropzone';
import oboe from 'oboe';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { Formik } from 'formik';
import * as yup from 'yup'; // for everything
import InputGroup from 'react-bootstrap/InputGroup'
import Col from 'react-bootstrap/Col'



function Example({ onComplete, handleClose }) {

    const [percentLoaded, setPercentLoaded] = React.useState(0);


    const maxSize = 204857600;
    const centerPoint = {
        lat: 48.85341,
        lng: 2.3488
    }

    const centerPointToExclude = {
        lat: 48.81670,
        lng: 2.2333
    }

    const distanceToCenter = 15;
    const distanceToCenterToExclude = 3;

    const onDrop = React.useCallback(acceptedFiles => {
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
                isLocationWithinDistance = checkIfWithinDistance(location, centerPoint, distanceToCenter)
            }

            if (centerPointToExclude) {
                isNotWithinDistance = !checkIfWithinDistance(location, centerPointToExclude, distanceToCenterToExclude)
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

    }, []
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



    const schema = yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        username: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        zip: yup.string().required(),
        terms: yup.bool().required(),
    });


    return (

        <>

            <Modal show={true} onHide={handleClose} >
                <Modal.Header closeButton >
                    <Modal.Title>What's my center of Gravity?</Modal.Title>

                </Modal.Header>
                <Modal.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={console.log}
                        initialValues={{
                            firstName: 'Mark',
                            lastName: 'Otto',
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                                <Form noValidate onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} md="4" controlId="validationFormik01">
                                            <Form.Label>First name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={values.firstName}
                                                onChange={handleChange}
                                                isValid={touched.firstName && !errors.firstName}
                                            />
                                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md="4" controlId="validationFormik02">
                                            <Form.Label>Last name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={values.lastName}
                                                onChange={handleChange}
                                                isValid={touched.lastName && !errors.lastName}
                                            />

                                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md="4" controlId="validationFormikUsername">
                                            <Form.Label>Username</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Username"
                                                    aria-describedby="inputGroupPrepend"
                                                    name="username"
                                                    value={values.username}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.username}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.username}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md="6" controlId="validationFormik03">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="City"
                                                name="city"
                                                value={values.city}
                                                onChange={handleChange}
                                                isInvalid={!!errors.city}
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {errors.city}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId="validationFormik04">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="State"
                                                name="state"
                                                value={values.state}
                                                onChange={handleChange}
                                                isInvalid={!!errors.state}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.state}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId="validationFormik05">
                                            <Form.Label>Zip</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zip"
                                                name="zip"
                                                value={values.zip}
                                                onChange={handleChange}
                                                isInvalid={!!errors.zip}
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {errors.zip}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Group>
                                        <Form.Check
                                            required
                                            name="terms"
                                            label="Agree to terms and conditions"
                                            onChange={handleChange}
                                            isInvalid={!!errors.terms}
                                            feedback={errors.terms}
                                            id="validationFormik0"
                                        />
                                    </Form.Group>
                                    <Button type="submit">Submit form</Button>
                                </Form>
                            )}
                    </Formik>

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
                </Modal.Body>
                <Modal.Footer>
                    <div>
                        {percentLoaded > 0 &&
                            <ProgressBar animated now={percentLoaded} label={`${percentLoaded}%`} />
                        }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Example;

