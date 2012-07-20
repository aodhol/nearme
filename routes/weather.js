var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

// Reverse geo-code: http://open.live.bbc.co.uk/locator/locations?la=51.508&lo=-0.125


exports.find_by_postcode = function(req, res){
     /*
     1. Translate postcode to lat lon.
     2. Use lat lon in sparql query.
     3. Display news stories.
     */

     var country = req.param('country', 'GB');
     var maxRows = parseInt(req.param('maxRows', '1'));
     var username = req.param('username', 'mdgardiner');

     var postcode = req.params.postcode;

     // Call the GeoNames API to get the lat and long...

     console.log('GEONAMES REQUEST: http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username);

     var request = restler.get('http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username);

     request.on('complete', function(result) {
          if (result instanceof Error) {
            console.log('Error: ' + result.message);
          } else {
            
            console.log('result: ' + result);

            var parser = new xml2js.Parser();
            parser.parseString(result, function (err, parseResult) {
                
                var xmlLat = parseResult.code.lat;
                var xmlLng = parseResult.code.lng;

                console.log('Done: ' + xmlLat + ' ' + xmlLng);

                //res.redirect('/articles/coordinates/' + xmlLat +',' + xmlLng);

                console.log('LOCATION API REQUEST: http://open.live.bbc.co.uk/locator/locations?la='+ xmlLat +'&lo='+ xmlLng);

                var reverseGeoCodeRequest = restler.get('http://open.live.bbc.co.uk/locator/locations?la='+ xmlLat +'&lo='+ xmlLng);

                reverseGeoCodeRequest.on('complete', function(revResult) {
                    if (revResult instanceof Error) {
                        console.log('Error: ' + revResult.message);
                    } else {

                        console.log('revResult: ' + revResult);

                        /*var revParser = new xml2js.Parser();
                        revParser.parseString(revResult, function (revErr, revParseResult) {
                            
                            console.log('revParseResult: ' + revParseResult);

                            var id = revParseResult.results.location.id;

                            console.log('REQUESTING WEATHER: http://open.live.bbc.co.uk/weather/feeds/en/'+ id +'/3dayforecast.json');

                            res.redirect('http://open.live.bbc.co.uk/weather/feeds/en/'+ id +'/3dayforecast.json');
                        })*/


                    }
                })
            });

          }
      });

};

