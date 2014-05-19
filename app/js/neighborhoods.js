
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


var map = L.map('map')
	.setView([40.75, -73.94], 12);

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'examples.map-20v6611k'
}).addTo(map);

//Create neighborhood layers

//Holds all Nodes and Edges
var neighborhoodGraph = [];
var neighborhoodBlobs = L.geoJson(neighborhoods).addTo(map);

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

_.forEach(neighborhoodBlobs['_layers'], function(neighborhood) {
	//Get Neighborhood Centroid
	if(neighborhood.feature.geometry.type == 'Polygon') {
		var coordinates = L.latLngBounds(neighborhood.getLatLngs()).getCenter();
		//Get Boro and Neighborhood Name
		var BoroName = neighborhood.feature.properties.BoroName;
		var NTAName = neighborhood.feature.properties.NTAName;

		neighborhoodGraph.push(new Hub(BoroName, NTAName, coordinates));
	};
});

setTimeout(function(){
//Load Citibike data
d3.csv("/app/data/d.csv", function(d) {
	var format = d3.time.format("%Y-%m-%d %H:%M:%S");
	var layer = leafletPip.pointInLayer([+d.start_station_longitude, +d.start_station_latitude], neighborhoodBlobs);

	console.log(layer[0].feature.properties.NTAName);
	var n = _.find(neighborhoodGraph, function(neighborhood) {
		return neighborhood.feature.properties.NTAName == layer[0].feature.properties.NTAName;
	});
	console.log(n.feature.properties.NTAName);
	
	return {
		tripduration: +d.tripduration, 
		starttime: format.parse(d.starttime),
		stoptime: format.parse(d.stoptime),
		start_station_id: +d.start_station_id,
		start_station_name: d.start_station_name, 
		start_station_lat: +d.start_station_latitude, 
		start_station_lng: +d.start_station_longitude, 
		end_station_id: +d.end_station_id, 
		end_station_name: d.end_station_name, 
		end_station_lat: +d.end_station_latitude, 
		end_station_lng: +d.end_station_longitude,
		bikeid: +d.bikeid,
		usertype: d.usertype,
		birth_year: +d.birth_year,
		gender: +d.gender
	};
}, function(error, rows) {
	//console.log(rows);
});

}, 15);



var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

_.forEach(neighborhoodGraph, function(neighborhood) {
	L.geoJson(neighborhood, {
	    pointToLayer: function (feature, latlng) {
	        return L.circleMarker(latlng, geojsonMarkerOptions);
	    }
	}).addTo(map);
});
