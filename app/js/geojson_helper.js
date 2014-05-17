
L.MultiPolygon.prototype.getLatLngs = function() {
    var polygons = [];

    this.eachLayer( function( layer ) {
        polygons.push( layer._latlngs );
        if( layer._holes && layer._holes.length ) {
            polygons.addObjects( layer._holes );
        }
    }, this );

    return polygons;
};


//Create Node
function Node(NTAName, coordinates) {
  this.type = "Feature",
  this.properties = new Properties(NTAName),
  this.geometry = new Point(coordinates)
}

function Properties(NTAName) {
  this.NTAName = NTAName,
  this.count = { 
    "0": {"0": 0, "1": 0, "2": 0,"3": 0,"4": 0,"5": 0,"6": 0,"7": 0,"8": 0,"9": 0,"10": 0,"11": 0,"12": 0,"13": 0,"14": 0,"15": 0,"16": 0,"17": 0,"18": 0,"19": 0,"20": 0,"21": 0,"22": 0,"23": 0 },
    "1": {"0": 0, "1": 0, "2": 0,"3": 0,"4": 0,"5": 0,"6": 0,"7": 0,"8": 0,"9": 0,"10": 0,"11": 0,"12": 0,"13": 0,"14": 0,"15": 0,"16": 0,"17": 0,"18": 0,"19": 0,"20": 0,"21": 0,"22": 0,"23": 0 }
   }
}

function Point(coordinates) {
  this.type = "Point",
  this.coordinates = [coordinates.lat, coordinates.lng]
}

//Create Edge
function EdgeMap(startNTAName, endNTAName, coordinates) {
  this[endNTAName] = new Edge(startNTAName, coordinates)
}

function Edge(startNTAName, coordinates) {
  this.type = "Feature",
  this.properties = new Properties(startNTAName),
  this.geometry = new LineString(coordinates)
}

function LineString(coordinates) {
  this.type = "LineString",
  this.coordinates = coordinates
}