import oboe from'oboe';

function LatitudeAndLongitude() {
oboe('/myapp/things.json')
   .node('foods.*', function( foodThing ){

      // This callback will be called everytime a new object is
      // found in the foods array.

      console.log( 'Go eat some', foodThing.name);
   })
   .node('badThings.*', function( badThing ){

      console.log( 'Stay away from', badThing.name);
   }) 
   .done(function(things){

      console.log(
         'there are', things.foods.length, 'things to eat',
         'and', things.nonFoods.length, 'to avoid'); 
   });
   var os = new oboe();
   parseJSONFile( file, os )
   function parseJSONFile( file, oboeInstance ) {
    var fileSize = file.size;
    var prettyFileSize = prettySize(fileSize);
    var chunkSize = 512 * 1024; // bytes
    var offset = 0;
    var self = this; // we need a reference to the current object
    var chunkReaderBlock = null;
    var startTime = Date.now();
    var endTime = Date.now();
    var readEventHandler = function ( evt ) {
        if ( evt.target.error == null ) {
            offset += evt.target.result.length;
            var chunk = evt.target.result;
            var percentLoaded = ( 100 * offset / fileSize ).toFixed( 0 );
            status( percentLoaded + '% of ' + prettyFileSize + ' loaded...' );
            oboeInstance.emit( 'data', chunk ); // callback for handling read chunk
        } else {
            return;
        }
        if ( offset >= fileSize ) {
            oboeInstance.emit( 'done' );
            return;
        }

        // of to the next chunk
        chunkReaderBlock( offset, chunkSize, file );
    }

    chunkReaderBlock = function ( _offset, length, _file ) {
        var r = new FileReader();
        var blob = _file.slice( _offset, length + _offset );
        r.onload = readEventHandler;
        r.readAsText( blob );
    }

    // now let's start the read with the first block
    chunkReaderBlock( offset, chunkSize, file );
}




}

export default LatitudeAndLongitude;