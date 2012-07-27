var centroid = null;

var locations;

var infowindow = new google.maps.InfoWindow({ 
	content:  "<label>Name:</label><input class='location-name' type='text'/><div><label for='color1'>Color 1</label><input id='color1' name='color1' type='text' value='#333399'/></div><button id='location-button'>Set</button>"
});

var map,
	mapLoaded = false,
	AREA_KEY = 'bbc-local-';

var selectedLocation;

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
		}, polygonOptions:Location.defaultPolygonOptions
	});

	console.log("DEFAULT OPTS:",Location.defaultPolygonOptions)

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

				makeLocation(overlay);

				var path = overlay.getPath();

				centroid = getCentroid(path);
 			
				var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

				/*var label = new Label({"map":map});
				label.set('position',centroidLatLng);
				label.set('text','');

				var loc = new Location(new Date().getTime(),label,path);
				loc.setPolygon(overlay);

				locations.push(loc);*/
				updateLocationList(locations);

			/*	saveLocations();
								
				addListenersToLocation(loc);	
		
				showArticles(path,function(err,data){
					if(err !== null){
						$('section[role="main"]').html(data);
					}else{
						console.log("Error:" + err);
					}
				});*/

				
			}

		
	
		});

		//console.log(locations[0].getPolygon().getPath());

      }//Init.


function makeLocation(overlay,labelText){
	
	var path = overlay.getPath();

	centroid = getCentroid(path);

	var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

	var label = new Label({"map":map});
	label.set('position',centroidLatLng);
	label.set('text',labelText || 'Place ' + (locations.length+1));

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

	return location;
}

function handleOverlayClick(location){

	var centroid = getCentroid(location.getPath());

	var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

	infowindow.position = centroidLatLng;

	infowindow.open(map);

	var currentColour = location.getPolygon().fillColor;

	var labelText = location.getLabelText();

	$('input.location-name').val(labelText);

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

		console.log("PPPPPPPPP:",path);

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
    	setSelected(location);

		handleOverlayClick(location);
	});

}

function setSelected(location){
	if(selectedLocation != undefined){
		selectedLocation.selected = false;
		selectedLocation.getPolygon().setOptions({"strokeWeight":1});
	}

	selectedLocation = location;
	selectedLocation.selected = true;
	selectedLocation.getPolygon().setOptions({"strokeWeight":2});

	saveLocations();

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

			location.selected = stringifiedLocation.selected;

			if(location.selected == true){
				console.log("AREA IS SELECTED");
				setSelected(location);
			}

			var centroid = getCentroid(location.getPath());

          	label.set('text', stringifiedLocation.labelText || '');

        	label.set('position', new google.maps.LatLng(centroid.y,centroid.x));
			
			retrievedLocations[i] = location;//Replace stringified with real Location obj in ame array.
		}

		console.log("LOCS:",retrievedLocations)
		updateLocationList(retrievedLocations);
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
		callback(null,data);
	});

	jqxhr.fail(function(e) { console.log("error"); 
		callback(e,null)
	});
	jqxhr.always(function() { console.log("complete"); });
}

function getWeatherForCoordinates(y, x, callback) {
	var jqxhr = $.ajax( "/weather/coordinates/" + y + "," + x);

	jqxhr.done(function(data) { 
		callback(data);
	});

	jqxhr.fail(function(e) { console.log("weather error"); 
		callback(null)
	});
	jqxhr.always(function() { console.log("weather complete"); });
}

function getPeopleForCoordinates(y, x, callback) {
	var jqxhr = $.ajax( "/articles/localpeople/coordinates/" + y + "," + x);

	jqxhr.done(function(data) {
		callback(data);
	});

	jqxhr.fail(function(e) { console.log("people articles error");
		callback(null);
	});
	jqxhr.always(function() { console.log("people articles complete"); });
}

function getCompaniesForCoordinates(y, x, callback) {
	var jqxhr = $.ajax( "/articles/localcompanies/coordinates/" + y + "," + x);

	jqxhr.done(function(data) {
		callback(data);
	});

	jqhxr.fail(function(e) { console.log("company articles error"); 
		callback(null);
	});
	jqxhr.always(function() { console.log("company articles complete")});
}

function showArticles(path,callback){

	 var coordStr = pathToCoordinateString(path);

	 getArticlesWithinCoordinates(coordStr,callback);
}

function getCentroidLatLng(){
	var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);
}

function createLatLng(coordString) {
     var a = coordString.split(' ');
     return new google.maps.LatLng(a[0],a[1]);
}

function findLocation(location,callback){

	var jqxhr = $.ajax( "/data/postcodes/" + location + ".txt");

	jqxhr.done(function(data) {

		var parsed = data.split(/\n/);//data.split(/\n/g);
		console.log(parsed[0]);
		console.log(parsed[1]);

		var cleansed = [];

		for(var i = 0; i < parsed.length; i+=16){

			console.log("LOOPING");

			if(parsed[i].indexOf(".") > 1){

				var latLng = createLatLng(parsed[i]);


				cleansed.push(latLng);
			}
		}

		callback(null,cleansed);

var re=/^-?\d+$/;
var num="51.5175559871421 -0.0395448306677343";
console.log("IS INT:" + re.test(num));

	});

	jqxhr.fail(function(e) { 
		console.log("error"); 
		callback(e,null)
	});

	jqxhr.always(function() { 
		console.log("complete"); 
	});

}

function updateLocationList(locs) {
	var i, list = '';

	$('#favourite-locations').html('Favourite Locations (' + locs.length + ')<span></span>');
	for (i = 0; i < locs.length; i++) {
		list += '<li><a href="#" data-index="' + i + '">' + locs[i].getLabelText() + '</a></li>';
	}
	$('#location-list ul').html(list);

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

