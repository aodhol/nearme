/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var routes = require('./routes')

routes.articles  = require('./routes/articles');

var app = express();



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

app.get('/articles/coordinates/:lat,:lon',routes.articles.find_by_coordinates);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
