//Util class for holding x,y.
function Point(x,y){
	this.x  =x;
	this.y = y;
}

/*
 * Converts between Google coords an simplified x,y coords.
 */
function getPointsFromPath(path){
	
	var points = [];

	for(var i = 0; i < path.length; i++){

		var y = path.getAt(i).lat();
		var x = path.getAt(i).lng();
		points.push(new Point(x,y));
	}

	return points;
}

function getArea(points){

   var area = 0;

   var j = points.length - 1;
   var p1; 
   var p2;

   for (var i = 0; i < points.length; j = i++) {
      p1 = points[i]; 
      p2 = points[j];
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
   }
   
   area /= 2;

   return area;

}

function getCentroid(path){

	var points = getPointsFromPath(path);

	var x = 0; 
	var y = 0;
	var f;
	var j = points.length - 1;
	
	var p1; 
	var p2;

	for (var i = 0; i < points.length; j = i++) {
	  
	  p1 = points[i]; 
	  p2 = points[j];

	  f = p1.x * p2.y - p2.x * p1.y;
	  x += (p1.x+p2.x) * f;
	  y += (p1.y + p2.y) * f;
	
	}

	f = getArea(points) * 6;

	return new Point(x / f, y / f);

}

 
 
function mergeOptions(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

