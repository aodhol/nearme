var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

exports.find_by_coordinates = function(req, res){

    var distance = parseInt(req.param('distance', 10));

    var limit = parseInt(req.param('limit', 50));
    var orderby = req.param('orderby','distance');
    var site = req.param('site','news');

    var lat = req.params.lat;
    var lng = req.params.lng;

    var juicerUrl = 'http://juicer.responsivenews.co.uk/api/articles.json?binding=url&limit=50';
    var juicerPostData = {'data':
        '?thing omgeo:nearby(' + lat + ' ' + lng + ' \"' + distance + 'mi\") . ?company <http://dbpedia.org/ontology/headquarter> ?place . ?url <http://data.press.net/ontology/tag/about> ?company .'};

    console.log('JUICER REQUEST - QUERY: ' + JSON.stringify(juicerUrl));
    console.log('JUICER REQUEST - POST DATA: ' + juicerPostData);

    var juicerRequest = restler.post(juicerUrl, juicerPostData);

    juicerRequest.on('complete', function(data,response){
        console.log('Status Code: ' + response.statusCode);

        if (data instanceof Error) {
            console.log('Error: ' + data.message);
        } else {
            console.log('JUICER REQUEST DONE');
            //res.json(data);
            res.render('company-stories',{'articles':JSON.parse(data).articles});
        }

    });
};


exports.find_by_postcode = function(req, res){

    var country = req.param('country', 'GB');
    var maxRows = parseInt(req.param('maxRows', '1'));
    var username = req.param('username', 'mdgardiner');
    var feed = req.param('feed', 'hour');

    var postcode = req.params.postcode;

    var xmlLat = 0.0;
    var xmlLng = 0.0;
    var geonameId = 0;

    console.log('Postcode: ' + postcode);

    var geonamesUrl = 'http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username;

    console.log('GEONAMES REQUEST: ' + geonamesUrl );

    var geonamesRequest = restler.get(geonamesUrl);

    geonamesRequest.on('complete', function(geonamesResult, response){

        if ( geonamesResult instanceof Error ) {
            console.log('Error: ' + geonamesResult.message);
        } else {
            console.log('result: ' + geonamesResult);
            var parser = new xml2js.Parser();

            parser.parseString(geonamesResult, function (err, parseResult){
                if (parseResult != undefined && parseResult.code != undefined)
                {
                    xmlLat = parseResult.code.lat;
                    xmlLng = parseResult.code.lng;
                }
            });

            console.log('GEONAMES REQUEST DONE: la=' + xmlLat + ' lo=' + xmlLng);
            
            if (xmlLat != 0.0 && xmlLng != 0.0)
            {
                res.redirect('/articles/localcompanies/coordinates/' + xmlLat + ',' + xmlLng);
            } else {
                res.send(404);
            }

        }
    });
};

