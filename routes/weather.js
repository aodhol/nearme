var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

// Reverse geo-code: http://open.live.bbc.co.uk/locator/locations?la=51.508&lo=-0.125

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

    var geonameUrl = 'http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username;

    console.log('GEONAMES REQUEST: ' + geonameUrl);

    var geonameRequest = restler.get(geonameUrl);

    geonameRequest.on('complete', function(geonameResult){

        if (geonameResult instanceof Error) {

            console.log('Error: ' + geonameResult.message);

        } else {

            console.log('result: ' + geonameResult);

            var parser = new xml2js.Parser();

            parser.parseString(geonameResult, function (err, parseResult){
                if (parseResult != undefined && parseResult.code != undefined) {
                    xmlLat = parseResult.code.lat;
                    xmlLng = parseResult.code.lng;
                }
            });

            console.log('GEONAMES REQUEST DONE: la=' + xmlLat + ' lo=' + xmlLng);

        }

        if (xmlLat != 0.0 && xmlLng != 0.0) {

            var locationUrl = 'http://open.live.bbc.co.uk/locator/locations?la=' + xmlLat + '&lo=' + xmlLng + '&format=json';

            console.log('LOCATION API REQUEST: JSON ' + locationUrl);

            var locatorRequest = restler.get(locationUrl);
            
            locatorRequest.on('complete', function(locatorResult, response){

                console.log('Status Code: ' + response.statusCode);

                if (locatorResult instanceof Error) {

                    console.log('Error: ' + locatorResult.message);

                } else {

                    console.log('result: ' + JSON.stringify(locatorResult));

                    /* Have tried using JSON.parse() but it raises 
                        the error 'Error: Failed to parse 
                        JSON body: Unexpected token o'

                        Retrieving the data as XML, the xml2js parser also 
                        errors saying that there is a non-whitespace character
                        before the first tag and it fails to parse the data.

                        As a last resort the eval() call works...
                    */

                    //var resultJSON = JSON.parse(locatorResult); 
                    var resultJSON = eval(locatorResult);

                    geonameId = resultJSON.response.results.results[0].id;
                    
                    console.log('LOCATION REQUEST DONE: id=' + geonameId);

                    var feedname = '3dayforecast';

                    switch(feed){
                        case 'day':
                            feedname = '3dayforecast';
                        break;
                        case 'hour':
                            feedname = '3hourlyforecast';
                        break;
                        case 'obs':
                            feedname = 'obs';
                        break;
                    }
                    
                    var weatherUrl = 'http://open.live.bbc.co.uk/weather/feeds/en/'+ geonameId + '/' + feedname + '.json';

                    console.log('WEATHER API REQUEST (feed=' + feed + '):  ' + weatherUrl);
                    //res.redirect('http://open.live.bbc.co.uk/weather/feeds/en/'+ geonameId + '/' + feedname + '.json');

                    var weatherRequest = restler.get(weatherUrl);

                    weatherRequest.on('complete', function(weatherResult, response){

                        console.log('Status Code: ' + response.StatusCode);

                        if ( weatherResult instanceof Error) {

                            console.log('Error: ' + weatherResult.message);

                        } else {

                            res.json(weatherResult);

                        }

                    });
                }

            });
        } else {
            res.send(404);
        }  

    });

};

exports.find_by_coordinates = function(req, res){
    
    var feed = req.param('feed', 'hour');
    
    var lat = req.params.lat;
    var lng = req.params.lng;
    var geonameId = 0;

    console.log('LOCATION API REQUEST: JSON http://open.live.bbc.co.uk/locator/locations?la=' + lat + '&lo=' + lng);

    var locatorRequest = restler.get('http://open.live.bbc.co.uk/locator/locations?la=' + lat + '&lo=' + lng + '&format=json');
    
    locatorRequest.on('complete', function(locatorResult, response){

        console.log('Status Code: ' + response.statusCode);

        if (locatorResult instanceof Error) {

            console.log('Error: ' + locatorResult.message);

        } else {

            console.log('result: ' + JSON.stringify(locatorResult));

            /* Have tried using JSON.parse() but it raises 
                the error 'Error: Failed to parse 
                JSON body: Unexpected token o'

                Retrieving the data as XML, the xml2js parser also 
                errors saying that there is a non-whitespace character
                before the first tag and it fails to parse the data.

                As a last resort the eval() call works...
            */

            //var resultJSON = JSON.parse(locatorResult); 
            var resultJSON = eval(locatorResult);

            geonameId = resultJSON.response.results.results[0].id;
            
            console.log('LOCATION REQUEST DONE: id=' + geonameId);

            var feedname = '3dayforecast';

            switch(feed){
                case 'day':
                    feedname = '3dayforecast';
                break;
                case 'hour':
                    feedname = '3hourlyforecast';
                break;
                case 'obs':
                    feedname = 'obs';
                break;
            }
            
            console.log('WEATHER API REQUEST (feed=' + feed + '):  http://open.live.bbc.co.uk/weather/feeds/en/'+ geonameId +'/' + feedname + '.json');
            //res.redirect('http://open.live.bbc.co.uk/weather/feeds/en/'+ geonameId + '/' + feedname + '.json');

            var weatherRequest = restler.get('http://open.live.bbc.co.uk/weather/feeds/en/'+ geonameId + '/' + feedname + '.json');

            weatherRequest.on('complete', function(weatherResult, response){

                console.log('Status Code: ' + response.StatusCode);

                if ( weatherResult instanceof Error) {

                    console.log('Error: ' + weatherResult.message);

                } else {

                    res.json(weatherResult);

                }

            });
        }

    });

};


