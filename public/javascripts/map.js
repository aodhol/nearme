var centroid = null;

var locations;

var infowindow = new google.maps.InfoWindow({ 
	content:  "<label>Name: </label><input class='location-name' type='text'/><div><label for='color1'>Color: </label><input id='color1' name='color1' type='text' value='#333399'/></div><a class='location-link' href=''>Link</a><button id='location-button'>Set</button>"
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

	drawingManager.setMap(map);
        
    locations = retrieveLocations(map);

    drawLocations(locations,map);

    //Handle drawing poly from query string.
	var qsPoly = location.search.replace(/^.*?\=/, '');

    if(qsPoly != ''){
    	console.log('QS POLY:' + decodeURIComponent(qsPoly));
		qsPoly = decodeURIComponent(qsPoly);

		var label = new Label({"map":map});

    	var qsLocation = new Location(new Date().getTime(),label,undefined,qsPoly);

		var path = qsLocation.getPath();
		console.log("path:" + path)

		var centroid = getCentroid(path);

		var centroidLatLng = new google.maps.LatLng(centroid.y,centroid.x);

		label.set('position',centroidLatLng);

		label.set('text','Place ' + (locations.length+1));

		drawLocation(qsLocation,map);

		locations.push(qsLocation);

		saveLocations();
					
    }


	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		
		//This doesn't do anything at present.
		if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
			var radius = event.overlay.getRadius();
		}

		if (event.type == google.maps.drawing.OverlayType.POLYGON) {

			var overlay = event.overlay;

			var location = makeLocation(overlay);

			drawingManager.setDrawingMode(null);
			handleOverlayClick(location);
			setSelected(location);

			updateLocationList(locations);
	
			// showArticles(overlay.getPath(),function(err,data){
			// 	if(err !== null){
			// 		$('section[role="main"]').html(data);
			// 	}else{
			// 		console.log("Error:" + err);
			// 	}
			// });			
		}	

	});

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

	// showArticles(path,function(err,data){
	// 	if(err !== null){
	// 		$('section[role="main"]').html(data);
	// 	}else{
	// 		console.log("Error:" + err);
	// 	}
	// });

	return loc;
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

	$('a.location-link').attr('href','?polygon=' + encodeURIComponent(location.getEncodedPath()));
    
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

function drawLocation(location,map){
	var polygon = location.getPolygon();

	var path = polygon.getPath();

	polygon.setMap(map)

	addListenersToLocation(location);
}

function drawLocations(locations,map){

	for(var i = 0; i < locations.length; i++){

		var location = locations[i];

		drawLocation(location,map);

	}
}
     // google.maps.event.addDomListener(window, 'load', initialize);

function addListenersToLocation(location){

	console.log("adding liosteners to poly");

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

		if(location.selected != true){
			setSelected(location);
			saveLocations();
		}
	});

}

function setSelected(location){
	if(selectedLocation != undefined){
		selectedLocation.selected = false;
		selectedLocation.getPolygon().setOptions({"strokeWeight":1});
	}

	selectedLocation = location;
	selectedLocation.selected = true;
	selectedLocation.getPolygon().setOptions({"strokeWeight":3});

	showArticles(location.getPath(),function(err,data){
		$('section[role="main"]').html(data);		
	});

	var centroid = getCentroid(selectedLocation.getPolygon().getPath());

	getWeatherForCoordinates(centroid.y, centroid.x, function(data) {
		if(data) {
			$('#local-weather').html(data);
		} else {
			console.log("ERROR loading weather data:" + err.toString());
		}
	});

	getTravelForCoordinates(centroid.y, centroid.x, function(data) {
		if(data) {
			$('#local-travel').html(data);
		} else {
			console.log("ERROR loading travel data");
		}
	});

	getPeopleForCoordinates(centroid.y, centroid.x, function(data) {
		if(data) {
			$('#local-people').html(data);
		} else {
			console.log("ERROR loading local people data");
		}
	});

	getCompaniesForCoordinates(centroid.y, centroid.x, function(data) {
		if(data) {
			$('#local-companies').html(data);
		} else {
			console.log("ERROR loading local company data");
		}
	});

	$('#local').show();
	$('#local-area').html('<p><span class="area-colour" style="background-color:' +  location.getPolygon().fillColor + '"></span>'+ location.getLabelText() + '</p>');


$('#set-location h2').text('Local to me - ' + (location.getLabelText() || ''));


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
		
		var localStorageValues = localStorage.getItem('locations');


		if(localStorageValues === "undefined"){
			localStorageValues = "[]";
		}

		console.log("localstorage val:", localStorageValues);

		var retrievedLocations = JSON.parse(localStorageValues) || [];

		for(var i = 0; i < retrievedLocations.length; i++){

			var stringifiedLocation = retrievedLocations[i];
			
			var label = new Label({"map":map});

			var location = new Location(stringifiedLocation._id,label);

			location.setColour(stringifiedLocation.colour);

			location.setEncodedPath(stringifiedLocation.encodedPath);	

			location.selected = stringifiedLocation.selected;

			var centroid = getCentroid(location.getPath());

          	label.set('text', stringifiedLocation.labelText || '');

        	label.set('position', new google.maps.LatLng(centroid.y,centroid.x));
			
			retrievedLocations[i] = location;//Replace stringified with real Location obj in ame array.

			if(location.selected == true){
				setSelected(location);
			}

		}

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

function getTravelForCoordinates(y, x, callback) {
	var jqxhr = $.ajax( "/travel/coordinates/" + y + "," + x);

	jqxhr.done(function(data) {
		callback(data);
	});

	jqxhr.fail(function(e) { console.log("travel error");
		callback(null);
	});
	jqxhr.always(function() { console.log("travel complete"); });
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

	jqxhr.fail(function(e) { console.log("company articles error"); 
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

		var cleansed = [];

		for(var i = 0; i < parsed.length; i+=16){

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

	$('#favourite-locations > a').html('Favourite Locations (' + locs.length + ')<span class="expand-icon"></span>');
	for (i = 0; i < locs.length; i++) {


//				list += '<li><a href="#" data-index="' + i + '">' + locs[i].getLabelText() + '</a></li>';

		list += '<li><a href="#" data-index="' + i + '">' + locs[i].getLabelText() + '</a><span class="area-colour" style="background-color:' + locs[i].getPolygon().fillColor+ '"></span></li>';
	}
	$('#favourite-locations ul').html(list);

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

