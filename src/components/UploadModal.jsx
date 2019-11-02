import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import React from "react";
import { useDropzone } from 'react-dropzone';
import oboe from 'oboe';



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
    return (
        <>

            <Modal show={true} onHide={handleClose} >
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
                <div>
                    {percentLoaded > 0 &&
                        <ProgressBar animated now={percentLoaded} label={`${percentLoaded}%`} />
                    }
                </div>

            </Modal>
        </>
    );
}

export default Example;

