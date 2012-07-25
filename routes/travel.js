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

    console.log('GEONAMES REQUEST: http://api.geonames.org/countrySubdivision?lat=' + lat + '&lng=' + lng + '&level=4&username=mdgardiner');

    var geonamesRequest = restler.get('http://api.geonames.org/countrySubdivision?lat=' + lat + '&lng=' + lng + '&level=4&username=mdgardiner');
    
    geonamesRequest.on('complete', function(geonameResult, response){

        console.log('Status Code: ' + response.statusCode);

        if (geonameResult instanceof Error) {

            console.log('Error: ' + geonameResult.message);

        } else {

            console.log('result: ' + geonameResult);

            var parser = new xml2js.Parser();

            var countyName = '';

            parser.parseString(geonameResult, function (err, parseResult){
                countyName = parseResult.countrySubdivision.adminName2;
            });
            
            console.log('County Name: ' + countyName);
            
            var target = lookupData[countyName];

            if ( target != '' && target != undefined ) {
                console.log('TRAVEL API REQUEST:  http://www.bbc.co.uk' + target + '.json');
                //res.redirect('http://www.bbc.co.uk' + target + '.json');

                var travelRequest = restler.get('http://www.bbc.co.uk' + target + '.json');

                travelRequest.on('complete', function(travelResult, response){

                    console.log('Status Code: ' + response.statusCode);

                    if (travelResult instanceof Error) {

                        console.log('Error: ' + travelResult.message);

                    } else {

                        console.log('result: ' + geonameResult);

                        res.json(travelResult);

                    }

                });

            } else {
                console.log('County (' + countyName + ') not mapped');
                res.send(404);
            }
        }

    });

};


/*

Search parameters sent through to the Java API

    string language The language of the output
    string searchType The search type.
    string searchTerms The search terms.
    double longitude The longitude.
    double latitude The latitude.
    double range The range.
    boolean count Set to true to include a count.
    string transportModeFilter The transport mode.
    string transportOperatorFilter The transport operator.
    string sortBy How to sort the results.
    string sortOrder How to order the results (ASC or DESC).
    int limit The number of values per page. Requires an offset to be provided.
    int offset The offset (1 indexed). Requires a limit to be provided.
    boolean bypassCache Set to true to bypass the cache.
    int minSeverity Filter for incident severity
    string significance Filter on national/non-national incidents

Search parameters specific to the region search:

    string incidentType Filter on the type of incident (planned/unplanned/all).
    string messageType Filter on the type of message set (pti/rtm/all).
    string catchment Filter on catchment (wide/narrow/all). Wide includes "Nearby" message sets.
    string warning Filter on warning type (advanced/none/all). Advanced includes "Advanced warning" message sets.
    boolean removeSets Set to true to remove message sets and return an array of messages (used for the original mobile site regions view).


*/



exports.find_incidents = function(req, res){

    var language = req.param('language', 'en');
    var searchType = req.param('searchType', 'free');
    var searchTerms = req.param('searchTerms', 'fire');
    var longitude = req.param('longitude');
    var latitude = req.param('latitude');
    var range = req.param('range');
    var count = req.param('count', '0');
    var transportModeFilter = req.param('transportModeFilter');
    var transportOperatorFilter = req.param('transportOperatorFilter');
    var sortBy = req.param('sortBy', 'severity,road,time');
    var groupBySeverity = req.param('groupBySeverity', '1')
    var sortOrder = req.param('sortOrder');
    var limit = req.param('limit');
    var offset = req.param('offset');
    var bypassCache = req.param('bypassCache');
    var minSeverity = req.param('minSeverity');
    var significance = req.param('significance');

    var incidentType = req.param('incidentType','unplanned');
    var messageType = req.param('messageType', 'rtm');
    var catchment = req.param('catchment', 'narrow');
    var warning = req.param('warning', 'none');
    var removeSets = req.param('removeSets', '1');

    var outputFormat = req.param('outputFormat', 'json')

    /*console.log('TRAVEL API REQUEST: http://www.bbc.co.uk/travelnews/api/outputs?language=' + language + '&searchType=' + searchType + 
        '&searchTerms=' + searchTerms + '&latitude=' + latitude + '&longitude=' + longitude + '&range=' + range + '&count=' + count +
        '&transportModeFilter=' + transportModeFilter + '&transportOperatorFilter=' + transportOperatorFilter + '&sortBy=' + sortBy + 
        '&sortOrder=' + sortOrder + '&limit=' + limit + '&offset=' + offset + '&bypassCache=' + bypassCache + '&minSeverity=' + minSeverity +
        '&significance=' + significance + '&incidentType=' + incidentType + '&messageType=' + messageType + '&catchment=' + catchment +
        '&warning=' + warning + '&removeSets=' + removeSets + '&groupBySeverity=' + groupBySeverity + '&outputFormat=' + outputFormat );*/

    /*var travelRequest = restler.get('http://www.bbc.co.uk/travelnews/api/outputs?language=' + language + '&searchType=' + searchType + 
        '&searchTerms=' + searchTerms + '&latiitude=' + latitude + '&longitude=' + longitude + '&range=' + range + '&count=' + count +
        '&transportModeFilter=' + transportModeFilter + '&transportOperatorFilter=' + transportOperatorFilter + '&sortBy=' + sortBy + 
        '&sortOrder=' + sortOrder + '&limit=' + limit + '&offset=' + offset + '&bypassCache=' + bypassCache + '&minSeverity=' + minSeverity +
        '&significance=' + significance + '&incidentType=' + incidentType + '&messageType=' + messageType + '&catchment=' + catchment +
        '&warning=' + warning + '&removeSets=' + removeSets + '&groupBySeverity=' + groupBySeverity + '&outputFormat=' + outputFormat );*/

/*
http://www.bbc.co.uk/travelnews/api/outputs?sortBy=severity,road,time&groupBySeverity=1&removeSets=1&catchment=narrow
    &warning=none&language=en&outputFormat=xhtml&incidentType=unplanned&messageType=rtm&count=0&searchTerms=fire&searchType=free
*/

    console.log('TRAVEL API REQUEST: http://www.bbc.co.uk/travelnews/api/outputs?language=' + language + '&searchType=' + searchType + 
        '&searchTerms=' + searchTerms + '&count=' + count +
        '&sortBy=' + sortBy + 
        '&incidentType=' + incidentType + '&messageType=' + messageType +
        '&warning=' + warning + '&removeSets=' + removeSets + '&groupBySeverity=' + groupBySeverity + '&outputFormat=' + outputFormat );

    var travelRequest = restler.get('http://www.bbc.co.uk/travelnews/api/outputs?language=' + language + '&searchType=' + searchType + 
        '&searchTerms=' + searchTerms + '&count=' + count +
        '&sortBy=' + sortBy + 
        '&incidentType=' + incidentType + '&messageType=' + messageType +
        '&warning=' + warning + '&removeSets=' + removeSets + '&groupBySeverity=' + groupBySeverity + '&outputFormat=' + outputFormat );

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

