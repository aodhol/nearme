function Location(_id,label,path,encodedPath){
	this._id = _id;
	this.label = label;
	this.path = path;
	this.encodedPath = encodedPath;

	//this.polygon = this.makePolygon(path);
}

Location.defaultPolygonOptions = {
	fillColor: '#ff0000',
	fillOpacity: 0.5,
	strokeColor: '#ff0000',
	strokeWeight: 1,
	clickable: true,
	editable: true,
	zIndex: 1,
	geodesic: true
};

Location.prototype = {

	makePolygon: function(path){

		var options = {"fillColor":this.colour,"path":this.getPath()};
		options = mergeOptions(Location.defaultPolygonOptions,options);
		var polygon = new google.maps.Polygon(options);

		return polygon;
	},
	setColour: function(colour){
		this.colour = colour;
	},
	getId: function(){
		return this._id;
	},
	getPolygon: function(){
		if(undefined == this.polygon){
			this.polygon = this.makePolygon(this.getPath());
		}
		return this.polygon;
	},
	setPolygon: function(polygon){
		this.polygon = polygon;
	},
	getPath: function(){
		if(this.path == undefined){
			var decodedPath = google.maps.geometry.encoding.decodePath(this.encodedPath);
			return new google.maps.MVCArray(decodedPath);
		}else{
			return this.path;
		}
	},
	getEncodedPath: function(){
		//if(this.encodedPath == undefined){
			var encodedPath = google.maps.geometry.encoding.encodePath(this.getPolygon().getPath());
			this.encodedPath = encodedPath;
		//}
		return this.encodedPath;
	},
	setEncodedPath: function(encodedPath){
		this.encodedPath = encodedPath;
	},
	getLabelText: function(){
		if(this.label != undefined){
			return this.label.get('text').toString();
		}
		return this.labelText;
	},
	getLabel: function(){
		return this.label;
	},
	toJSON: function(){
		return {"_id":this._id, "labelText":this.getLabelText(),"encodedPath":this.getEncodedPath(),"colour":this.getPolygon().fillColor,"selected":this.selected || false};
	}
}
