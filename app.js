/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var routes = require('./routes')

routes.articles  = require('./routes/articles');
routes.weather = require('./routes/weather');
routes.travel = require('./routes/travel');

var app = express();


function print(obj, maxDepth, prefix){
   var result = '';
   if (!prefix) prefix='';
   for(var key in obj){
       if (typeof obj[key] == 'object'){
           if (maxDepth !== undefined && maxDepth <= 1){
               result += (prefix + key + '=object [max depth reached]\n');
           } else {
               result += print(obj[key], (maxDepth) ? maxDepth - 1: maxDepth, prefix + key + '.');
           }
       } else {
           result += (prefix + key + '=' + obj[key] + '\n');
       }
   }
   return result;
}

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use("/static", express.static(__dirname + '/static'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/articles/postcode/:postcode',routes.articles.find_by_postcode);

app.get('/articles/about/:subject',routes.articles.find_by_subject);

//app.get('/articles/coordinates/:lat,:lon',routes.articles.find_by_coordinates);

//app.get('/articles/coordinates/^\/points?(?:\/(\d+)(?:\.\.(\d+))?)?/',routes.articles.find_by_coordinates);

/*app.get('/articles/coordinates/points/', function(req, res){
    res.send(print(req.params));
});*/

app.get('/weather/postcode/:postcode',routes.weather.find_by_postcode);

app.get('/weather/coordinates/:lat,:lng',routes.weather.find_by_coordinates);

app.get('/travel/coordinates/:lat,:lng',routes.travel.find_by_coordinates);

app.get('/travel/incidents/coordinates/:lat,:lng',routes.travel.find_incidents);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/articles/coordinates/points/:points',routes.articles.find_by_polygon_points);

