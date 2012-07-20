

    	var map;

      	function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(51.500152,-0.126236),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

         map = new google.maps.Map(document.getElementById('map_canvas'),
          mapOptions);

        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.MARKER,
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.POLYGON
            ]
          },
          markerOptions: {
            icon: 'images/beachflag.png'
          },
          polygonOptions: {
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

		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
			
			//This doesn't do anything at present.
			if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
				var radius = event.overlay.getRadius();
			}

			if (event.type == google.maps.drawing.OverlayType.POLYGON) {

				var path = event.overlay.getPath();
				
				savePolygon(path);
				
				addListenersToPolygon(path);	
		
				showArticles(path,function(err,data){
					if(err == null){
						console.log(data.articles.length + " articles found",data);

					}else{
						console.log("Error:" + err.toString());
					}
				});


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

		location.getPath().getAt(0);

		addListenersToPolygon(location.getPath());
	
		showArticles(path,function(err,data){
			if(err == null){
				console.log(data.articles.length + " articles found",data);

			}else{
				console.log("Error:" + err.toString());
			}
		});

		location.setMap(map);

      }//Init.

      google.maps.event.addDomListener(window, 'load', initialize);

	function addListenersToPolygon(path){

	console.dir("ADJUSTED:",path);

	google.maps.event.addListener(path, "set_at", function(){
		console.log("Saving path");
		savePolygon(path);

		showArticles(path,function(err,data){
			if(err == null){
				console.log(data);
			}
		});
	});

	google.maps.event.addListener(path, "insert_at", function(){
		console.log("Saving path");
		savePolygon(path);

		showArticles(path,function(err,data){
			if(err == null){
				console.log(data);
			}else{
				console.log("Error:" + err.toString());
			}
		});

	});	
}

function savePolygon(path){
	if(typeof(Storage) !== "undefined"){
		console.log("Setting poly in localstorage");

		var encodedPath = google.maps.geometry.encoding.encodePath(path);

		localStorage.polygon = encodedPath;
	}
}

function retrievePolygon(){

	if(typeof(Storage) !== "undefined"){

		console.log("Getting poly from localstorage");

		var encodedPath = localStorage.polygon;

		var decodedPath = google.maps.geometry.encoding.decodePath(encodedPath);

		return new google.maps.MVCArray(decodedPath);
	}
}

function pathToCoordinateString(path){
 	
	var coords = [];

  	for (var i = 0; i < path.length; i++) {
  		var xy = path.getAt(i).toUrlValue();
  		coords.push(xy);
  	}

  	var coordString = coords.join(' ');

  	return coordString;

}

function getArticlesWithinCoordinates(coordinates,callback){
	var jqxhr = $.ajax( "/articles/coordinates/points/" + coordinates);

    jqxhr.done(function(data) { 
    	//$('#results').text(JSON.stringify(data));
    	callback(null,data);
    });

    jqxhr.fail(function(e) { console.log("error"); 
    	callback(e,null)
	});
    jqxhr.always(function() { console.log("complete"); });
}

function showArticles(path,callback){
	var coordStr = pathToCoordinateString(path);
	getArticlesWithinCoordinates(coordStr,callback);
}