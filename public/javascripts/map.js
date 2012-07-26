var centroid = null;

var locations;

var infowindow = new google.maps.InfoWindow({ 
	content:  "<label>Name:</label><input class='location-name' type='text'/><div><label for='color1'>Color 1</label><input id='color1' name='color1' type='text' value='#333399'/></div><button id='location-button'>Set</button>"
});

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

        locations = retrieveLocations(map);
        drawLocations(locations,map);

		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
			
			//This doesn't do anything at present.
			if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
				var radius = event.overlay.getRadius();
			}

			if (event.type == google.maps.drawing.OverlayType.POLYGON) {

				var overlay = event.overlay;

				var path = overlay.getPath();

				centroid = getCentroid(path);
 			
				var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

				var label = new Label({"map":map});
				label.set('position',centroidLatLng);
				label.set('text','');

				var loc = new Location(new Date().getTime(),label,path);
				loc.setPolygon(overlay);

				locations.push(loc);

				saveLocations();
								
				addListenersToLocation(loc);	
		
				showArticles(path,function(err,data){
					if(err !== null){
						$('section[role="main"]').html(data);
					}else{
						console.log("Error:" + err);
					}
				});
				
			}

		
	
		});

      }//Init.

function handleOverlayClick(location){

	var centroid = getCentroid(location.getPath());

	var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

	infowindow.position = centroidLatLng;

	infowindow.open(map);

	var currentColour = location.getPolygon().fillColor;

	$('#color1').val(currentColour)
		
	$('#color1').colorPicker();
    
	$('#location-button').click(function(element){

		var labelText = $('.location-name').val();
		
		var fillColour = $('.colorPicker-picker').css('background-color');

		var label = location.getLabel();

		location.getPolygon().setOptions({"fillColor":fillColour})

      	label.set('text', labelText);

    	label.set('position', new google.maps.LatLng(centroid.y,centroid.x));

    	infowindow.close();

    	saveLocations();

    }); 
}

function drawLocations(locations,map){

	for(var i = 0; i < locations.length; i++){

		var location = locations[i];

		var polygon = location.getPolygon();

		var path = polygon.getPath();

		console.log("PPPPPPPPP:",path)

		polygon.setMap(map)

		addListenersToLocation(location);

		showArticles(path,function(err,data){
			if(err !== null){
				$('section[role="main"]').html(data);
			}else{
				console.log("Error:" + err);
			}
		});
	}
}
     // google.maps.event.addDomListener(window, 'load', initialize);

function addListenersToLocation(location){

	var path  = location.getPath();

	var polygon = location.getPolygon();


	google.maps.event.addListener(location.getPolygon().getPath(), "set_at", function(){

		var path = location.getPath();

		saveLocations();

		var centroid = getCentroid(path);

		showArticles(path,function(err,data){
			$('section[role="main"]').html(data);
		});

		var label = location.getLabel();

		label.set('position',new google.maps.LatLng(centroid.y,centroid.x));
		
	});


	google.maps.event.addListener(location.getPolygon().getPath(), "insert_at", function(){

		saveLocations();
		var centroid = getCentroid(path);
		showArticles(path,function(err,data){
			$('section[role="main"]').html(data);
		});

		var label = location.getLabel();
		label.set('position',new google.maps.LatLng(centroid.y,centroid.x));

	});	

    google.maps.event.addListener(polygon,'click', function(event) {
		handleOverlayClick(location);
	});

}

function saveLocations(){

	if(typeof(Storage) !== "undefined"){
		console.log('STRINGIFIED:'+ JSON.stringify(locations));
		localStorage.setItem('locations',JSON.stringify(locations));		
	}
}

function retrieveLocations(map){

	var retrievedLocations;

	if(typeof(Storage) !== "undefined"){
		
		var retrievedLocations = JSON.parse(localStorage.getItem('locations')) || [];

		for(var i = 0; i < retrievedLocations.length; i++){

			var stringifiedLocation = retrievedLocations[i];
			
			var label = new Label({"map":map});

			var location = new Location(stringifiedLocation._id,label);

			location.setColour(stringifiedLocation.colour);

			location.setEncodedPath(stringifiedLocation.encodedPath);	

			var centroid = getCentroid(location.getPath());

          	label.set('text', stringifiedLocation.labelText || '');

        	label.set('position', new google.maps.LatLng(centroid.y,centroid.x));
			
			retrievedLocations[i] = location;//Replace stringified with real Location obj in ame array.
		}

		console.log("LOCS:",retrievedLocations)

	}

	return retrievedLocations;
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


function showArticles(path,callback){

	 var coordStr = pathToCoordinateString(path);

	 getArticlesWithinCoordinates(coordStr,callback);
}

function getCentroidLatLng(){
	var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);
}

/*function getWeather(lat,lon,callback){

	if(centroid != null){

		console.log("centroid not null:" + centroid.x + "," + centroid.y);

		getWeatherForCoordinates(centroid.y,centroid.x,function(err,data){

	console.log("DAT:",data);

			if(err != null){
				console.log(data);
			}else{
				console.log("Weather Error: " + err);
			}
			//$('section[role="main"]').html(data);
		});

	}else{
		console.log("centroid is null");
	}

}*/

