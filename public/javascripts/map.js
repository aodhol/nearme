var map,
	mapLoaded = false,
	AREA_KEY = 'bbc-local-';

function initialiseMap(mapCanvas) {

	var mapOptions = {
		center: new google.maps.LatLng(51.500152, -0.126236),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById(mapCanvas), mapOptions);

	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: true,
		drawingControlOptions: {
			position:
				google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					//google.maps.drawing.OverlayType.MARKER,
					//google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.POLYGON
				]
		}, markerOptions: {
			icon: 'images/beachflag.png'
		}, polygonOptions: {
			fillColor: '#ff0000',
			fillOpacity: 0.5,
			strokeColor: '#ff0000',
			strokeWeight: 2,
			clickable: false,
			editable: true,
			zIndex: 1
		}
	});

	drawingManager.setMap(map);

	function addMarker(location) {
		marker = new google.maps.Marker({
			position: location,
			map: map
		});
		// markersArray.push(marker);
	}

	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		//This doesn't do anything at present.
		if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
			var radius = event.overlay.getRadius();
		}

		if (event.type == google.maps.drawing.OverlayType.POLYGON) {
			var path = event.overlay.getPath();
			var centroid = getCentroid(path);
 			var centroidLatLng = new google.maps.LatLng(centroid.y, centroid.x)
			
			addMarker(centroidLatLng);
			savePolygon(path);
			addListenersToPolygon(path);

			//showArticles(path);
		}
	});

	var path = retrievePolygon();

	var location = new google.maps.Polygon({
		path:path,
		fillColor: '#ff0000',
		fillOpacity: 0.5,
		strokeColor: '#ff0000',
		strokeWeight: 2,
		clickable: false,
		editable: true,
		zIndex: 1
	});

	addListenersToPolygon(location.getPath());
	location.setMap(map);
} // initialiseMap()

// google.maps.event.addDomListener(window, 'load', initialize);

function addListenersToPolygon(path) {
	google.maps.event.addListener(path, "set_at", function() {
		savePolygon(path);
		showArticles(path);
	});

	google.maps.event.addListener(path, "insert_at", function() {
		console.log("Saving path");
		savePolygon(path);
		showArticles(path);
	});	
}

function savePolygon(path) {
	if(typeof(Storage) !== "undefined") {
		var encodedPath = google.maps.geometry.encoding.encodePath(path);
		localStorage[AREA_KEY + '1'] = encodedPath;
	}
}

function retrievePolygon() {
	if(typeof(Storage) !== "undefined") {
		var encodedPath = localStorage[AREA_KEY + '1'];
		var decodedPath = google.maps.geometry.encoding.decodePath(encodedPath);
		return new google.maps.MVCArray(decodedPath);
	}
}

function pathToCoordinateString(path) {
	var coords = [];

	for (var i = 0; i < path.length; i++) {
		var xy = path.getAt(i).toUrlValue();
		coords.push(xy);
	}

	var coordString = coords.join(' ');
	return coordString;
}

function getArticlesWithinCoordinates(coordinates,callback) {
	var jqxhr = $.ajax( "/articles/coordinates/points/" + coordinates);

	jqxhr.done(function(data) { 
		callback(data);
	});

	jqxhr.fail(function(e) { console.log("error"); 
		callback(null)
	});
	jqxhr.always(function() { console.log("complete"); });
}

function showArticles(path) {
	if(path == null){
		path = retrievePolygon();
	}

	var coordStr = pathToCoordinateString(path);
	getArticlesWithinCoordinates(coordStr, function(data) {
		if (data) $('#story-list').html(data);
	});
}