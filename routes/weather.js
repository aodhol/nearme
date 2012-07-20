var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

// Reverse geo-code: http://open.live.bbc.co.uk/locator/locations?la=51.508&lo=-0.125

exports.find_by_postcode = function(req, res){
    var country = req.param('country', 'GB');
    var maxRows = parseInt(req.param('maxRows', '1'));
    var username = req.param('username', 'mdgardiner');

    var postcode = req.params.postcode;
    var xmlLat = 0.0;
    var xmllng = 0.0;
    var geonameId = 0;

    console.log('GEONAMES REQUEST: http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username);

    var geonameRequest = restler.get('http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username);

    geonameRequest.on('complete', function(geonameResult){

        if (geonameResult instanceof Error) {

            console.log('Error: ' + geonameResult.message);

        } else {

            console.log('result: ' + geonameResult);

            var parser = new xml2js.Parser();

            parser.parseString(geonameResult, function (err, parseResult){
                xmlLat = parseResult.code.lat;
                xmlLng = parseResult.code.lng;
            });

            console.log('GEONAMES REQUEST DONE: la=' + xmlLat + ' lo=' + xmlLng);

        }

        console.log('LOCATION API REQUEST: JSON http://open.live.bbc.co.uk/locator/locations?la=' + xmlLat + '&lo=' + xmlLng);

        var locatorRequest = restler.get('http://open.live.bbc.co.uk/locator/locations?la=' + xmlLat + '&lo=' + xmlLng + '&format=json');
        //var locatorRequest = restler.get('http://open.live.bbc.co.uk/locator/locations?la=51.36047&lo=-0.25317&format=json');

        locatorRequest.on('complete', function(locatorResult, response){

            console.log('Status Code: ' + response.statusCode);

            if (locatorResult instanceof Error) {

                console.log('Error: ' + locatorResult.message);

            } else {

                console.log('result: ' + JSON.stringify(locatorResult));

                /*var locParser = new xml2js.Parser();

                locParser.parseString(geonameResult, function(err, parseResult){
                    geonameId = parseResult.;
                });*/

                var resultJSON = JSON.parse(locatorResult);

                for( var name in resultJSON ){
                    console.log(name);
                }
                
                console.log('LOCATION REQUEST DONE: id=' + geonameId);

            }

        });

    });

};




