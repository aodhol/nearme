var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

exports.find_by_coordinates = function(req, res){
    
    var lat = req.params.lat;
    var lng = req.params.lng;
    
    var lookupData = {'Bedfordshire': '/travelnews/threecounties',
            'Berkshire': '/travelnews/threecounties',
            'Borders': '/travelnews/southscotland',
            'Buckinghamshire': '/travelnews/threecounties',
            'Cambridgeshire': '/travelnews/cambridgeshire',
            'Central': '/travelnews/birmingham',
            'Cheshire': '/travelnews/cheshire',
            'Cornwall': '/travelnews/cornwall',
            'County Antrim': '/travelnews/northernireland',
            'County Armagh': '/travelnews/northernireland',
            'County Down': '/travelnews/northernireland',
            'County Fermanagh': '/travelnews/northernireland',
            'County Londonderry': '/travelnews/northernireland',
            'County Tyrone': '/travelnews/northernireland',
            'Cumbria': '/travelnews/cumbria',
            'Derbyshire': '/travelnews/derby',
            'Devon': '/travelnews/devon',
            'Dorset': '/travelnews/dorset',
            'Dumfries and Galloway': '',
            'Durham': '',
            'Dyfed': '',
            'East Sussex': '/travelnews/sussex',
            'Essex': '/travelnews/essex',
            'Fife': '',
            'Gloucestershire': '/travelnews/gloucestershire',
            'Grampian': '',
            'Greater Manchester': '/travelnews/manchester',
            'Gwent': '',
            'Gwynedd County': '',
            'Hampshire': '',
            'Herefordshire': '',
            'Hertfordshire': '/travelnews/threecounties',
            'Highlands and Islands': '/travelnews/highlandsandislands',
            'Humberside': '/travelnews/humber/2',
            'Isle of Wight': '',
            'Kent': '/travelnews/kent',
            'Lancashire': '/travelnews/lancashire',
            'Leicestershire': '/travelnews/leicester',
            'Lincolnshire': '/travelnews/lincolnshire',
            'Lothian': '/travelnews/southscotland',
            'Merseyside': '',
            'Mid Glamorgan': '/travelnews/midwales',
            'Norfolk': '/travelnews/norfolk',
            'North Yorkshire': '/travelnews/york',
            'Northamptonshire': '/travelnews/northampton',
            'Northumberland': '',
            'Nottinghamshire': '/travelnews/nottingham',
            'Oxfordshire': '/travelnews/oxford',
            'Powys': '',
            'Rutland': '',
            'Shropshire': '/travelnews/shropshire',
            'Somerset': '/travelnews/somerset',
            'South Glamorgan': '/travelnews/southeastwales',
            'South Yorkshire': '/travelnews/sheffield',
            'Staffordshire': '',
            'Strathclyde': '',
            'Suffolk': '/travelnews/suffolk',
            'Surrey': '/travelnews/surrey',
            'Tayside': '',
            'Tyne and Wear': '/travelnews/tyne',
            'Warwickshire': '',
            'West Glamorgan': '/travelnews/southwestwales',
            'West Midlands': '/travelnews/birmingham',
            'West Sussex': '/travelnews/sussex',
            'West Yorkshire': '/travelnews/york',
            'Wiltshire': '/travelnews/wiltshire',
            'Worcestershire': '',
    };

    var geonameUrl = 'http://api.geonames.org/countrySubdivision?lat=' + lat + '&lng=' + lng + '&level=4&username=mdgardiner';

    console.log('GEONAMES REQUEST: ' + geonameUrl);

    var geonamesRequest = restler.get(geonameUrl);
    
    geonamesRequest.on('complete', function(geonameResult, response){

        console.log('Status Code: ' + response.statusCode);

        if (geonameResult instanceof Error) {

            console.log('Error: ' + geonameResult.message);

        } else {

            console.log('result: ' + geonameResult);

            var parser = new xml2js.Parser();

            var countyName = '';

            parser.parseString(geonameResult, function (err, parseResult){
                if(parseResult != null && parseResult.countrySubdivision != undefined){
                    countyName = parseResult.countrySubdivision.adminName2;
                }
            });
            
            console.log('County Name: ' + countyName);
            
            var target = lookupData[countyName];

            if ( target != '' && target != undefined ) {

                var travelUrl = 'http://www.bbc.co.uk' + target + '.json';

                console.log('TRAVEL API REQUEST: ' + travelUrl);

                var travelRequest = restler.get(travelUrl);

                travelRequest.on('complete', function(travelResult, response){

                    console.log('Status Code: ' + response.statusCode);

                    if (travelResult instanceof Error) {

                        console.log('Error: ' + travelResult.message);

                    } else {

                        console.log('result: ' + geonameResult);

                        //res.json(travelResult);
                        res.render('travel', travelResult);

                    }

                });

            } else {
                console.log('County (' + countyName + ') not mapped');
                res.send(404);
            }
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

    console.log('Postcode: ' + postcode);

    var geonamesUrl = 'http://api.geonames.org/postalCodeSearch?postalcode=' + escape(postcode) + '&country='+ country +'&maxRows=' + maxRows + '&username='+ username;

    console.log('GEONAMES REQUEST: ' + geonamesUrl);
    var geonamesRequest = restler.get(geonamesUrl);

    geonamesRequest.on('complete', function(geonamesResult, response){

        if(geonamesResult instanceof Error) {
            console.log('Error: ' + geonamesResult.message);
        } else {
            console.log('result: ' + geonamesResult);
            var parser = new xml2js.Parser();

            parser.parseString(geonamesResult, function(err, parseResult) {
                if(parseResult != undefined && parseResult.code != undefined) {
                    xmlLat = parseResult.code.lat;
                    xmlLng = parseResult.code.lng;
                }
            });

            console.log('GEONAMES REQUEST DONE: la=' + xmlLat + ' lo=' + xmlLng);

            if (xmlLat != 0.0 && xmlLng != 0.0){
                res.redirect('/travel/coordinates/' + xmlLat + ',' +xmlLng);
            } else {
                res.send(404);
            }
        }
    });

};

exports.find_incidents = function(req, res){

    var language = req.param('language', 'en');
    var searchType = req.param('searchType', 'free');
    var searchTerms = req.param('searchTerms', 'police');
    var range = req.param('range', '50');
    var count = req.param('count', '0');
    var sortBy = req.param('sortBy', 'severity,road,time');
    var groupBySeverity = req.param('groupBySeverity', '1')
    var incidentType = req.param('incidentType','unplanned');
    var messageType = req.param('messageType', 'all');
    var catchment = req.param('catchment', 'narrow');
    var warning = req.param('warning', 'none');
    var removeSets = req.param('removeSets', '1');

    var outputFormat = req.param('outputFormat', 'json')

    var latitude = req.params.lat;
    var longitude = req.params.lng;

    var travelUrl = 'http://www.bbc.co.uk/travelnews/api/outputs?language=' + language + '&searchType=' + searchType + 
        '&searchTerms=' + searchTerms + '&range=' + range + '&count=' + count + '&sortBy=' + sortBy + '&groupBySeverity=' + groupBySeverity +
        '&incidentType=' + incidentType + '&messageType=' + messageType + '&catchment=' + catchment + '&warning=' + warning + 
        '&removeSets=' + removeSets + '&outputFormat=' + outputFormat + '&latitude' + latitude + '&longitude=' + longitude;

    console.log('TRAVEL API REQUEST: ' + travelUrl );

    var travelRequest = restler.get(travelUrl);

    travelRequest.on('complete', function(travelResult, response){

        console.log('Status Code: ' + response.statusCode);

        if ( travelResult instanceof Error ) {

            console.log('Error: ' + travelResult.message);

        } else {

            console.log('result: ' + travelResult);

            res.send(travelResult);

        }

    });


};

