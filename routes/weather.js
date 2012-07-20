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

    });

};




