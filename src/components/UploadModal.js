import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import React from "react";
import { useDropzone } from 'react-dropzone';
import oboe from 'oboe';



function Example({ onComplete }) {
    const [show, setShow] = React.useState(true);
    const handleClose = () => setShow(false);

    const maxSize = 204857600;
    const centerPoint = {
        lat: 48.85341,
        lng: 2.3488
    }

    const centerPointToExclude = {
        lat: 48.81670,
        lng: 2.2333
    }
    const distanceToCenter = 12;
    const distanceToCenterToExclude = 3;

    const onDrop = React.useCallback(acceptedFiles => {
        console.log(acceptedFiles);
        const acceptedFile = acceptedFiles[0];
        let centerOfGravityLatitude = 0
        let centerOfGravityLongitude = 0
        let latitudeSum = 0;
        let longitudeSum = 0;
        let positionCount = 0;
        var os = new oboe();
        os.node('locations.*', function (location) {

            let isLocationWithinDistance = true;
            let isNotWithinDistance = true;
            if (true) {
                isLocationWithinDistance = checkIfWithinDistance(location)
                isNotWithinDistance = checkNotWithinDistance(location)
            }

            if (isLocationWithinDistance && isNotWithinDistance) {
                latitudeSum = latitudeSum + location.latitudeE7;

                longitudeSum = longitudeSum + location.longitudeE7
                ++positionCount;
            }
        }).done(function () {
            console.log('position count' + positionCount)
            centerOfGravityLatitude = latitudeSum / positionCount / 10000000;
            centerOfGravityLongitude = longitudeSum / positionCount / 10000000;
            console.log('Average Latitude ' + centerOfGravityLatitude)
            console.log('Average Longitude ' + centerOfGravityLongitude)
            onComplete(centerOfGravityLatitude, centerOfGravityLongitude)
            handleClose();
        });
        parseFile(acceptedFile, os);
    }, []);

    function checkNotWithinDistance(location) {

        var ky = 40000 / 360;
        var kx = Math.cos(Math.PI * centerPointToExclude.lat / 180.0) * ky;
        var dx = Math.abs(centerPointToExclude.lng - location.longitudeE7 / 10000000) * kx;
        var dy = Math.abs(centerPointToExclude.lat - location.latitudeE7 / 10000000) * ky;
        return Math.sqrt(dx * dx + dy * dy) >= distanceToCenterToExclude;
    }

    function checkIfWithinDistance(location) {

        var ky = 40000 / 360;
        var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
        var dx = Math.abs(centerPoint.lng - location.longitudeE7 / 10000000) * kx;
        var dy = Math.abs(centerPoint.lat - location.latitudeE7 / 10000000) * ky;
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

            <Modal show={show} onHide={handleClose} >
                <Modal.Header closeButton >
                    <Modal.Title>What's my center of Gravity?</Modal.Title>

                </Modal.Header>

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
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} >
                        Close
            </Button>
                    < Button variant="primary" onClick={handleClose} >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Example;

