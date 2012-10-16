var restler = require('restler');

var async = require('async');

var xml2js = require('xml2js');

exports.find_by_coordinates = function(req, res){
    
    var lat = req.params.lat;
    var lng = req.params.lng;
    
    var lookupData = {
        'T6': '/travelnews/northeastscotland',
        'T5': '/travelnews/northeastscotland',
        'T8': '/travelnews/taysideandcentralscotland',
        'X1': '/travelnews/northwestwales',
        'T7': '/travelnews/northeastscotland',
        'Q6': '/travelnews/northernireland',
        'Q7': '/travelnews/northernireland',
        'Q8': '/travelnews/northernireland',
        'A4': '/travelnews/somerset',
        'A8': '/travelnews/lancashire',
        'Z5': '/travelnews/threecounties',
        'A1': '/travelnews/london',
        'B5': '/travelnews/kent',
        'A6': '/travelnews/london',
        'R3': '/travelnews/northernireland',
        'X3': '/travelnews/southeastwales',
        'X2': '/travelnews/southeastwales',
        'A7': '/travelnews/birmingham',
        'B9': '/travelnews/threecounties',
        'Q9': '/travelnews/northernireland',
        'R1': '/travelnews/northernireland',
        'B2': '/travelnews/dorset',
        'R2': '/travelnews/northernireland',
        'A2': '/travelnews/london',
        'B6': '/travelnews/sussex',
        'A3': '/travelnews/sheffield',
        'B1': '/travelnews/manchester',
        'A9': '/travelnews/lancashire',
        'B3': '/travelnews/berkshire',
        'B4': '/travelnews/leeds',
        'B8': '/travelnews/london',
        'B7': '/travelnews/bristol',
        'C1': '/travelnews/lancashire',
        'C3': '/travelnews/cambridgeshire',
        'X4': '/travelnews/southeastwales',
        'Z6': '/travelnews/threecounties',
        'X6': '/travelnews/midwales',
        'R8': '/travelnews/northernireland',
        'Z7': '/travelnews/stoke',
        'Z8': '/travelnews/liverpool',
        'R4': '/travelnews/northernireland',
        'R7': '/travelnews/northernireland',
        'C2': '/travelnews/leeds',
        'U1': '/travelnews/taysideandcentralscotland',
        'R6': '/travelnews/northernireland',
        'C9': '/travelnews/cumbria',
        'C4': '/travelnews/london',
        'X7': '/travelnews/southwestwales',
        'C6': '/travelnews/cornwall',
        'C7': '/travelnews/coventry',
        'X5': '/travelnews/southeastwales',
        'C8': '/travelnews/london',
        'R5': '/travelnews/northernireland',
        'X8': '/travelnews/northwestwales',
        'D1': '/travelnews/tees',
        'D3': '/travelnews/derby',
        'X9': '/travelnews/northeastwales',
        'D2': '/travelnews/derby',
        'D4': '/travelnews/devon',
        'S1': '/travelnews/northernireland',
        'U2': '/travelnews/southscotland',
        'D5': '/travelnews/sheffield',
        'U3': '/travelnews/taysideandcentralscotland',
        'D6': '/travelnews/dorset',
        'R9': '/travelnews/northernireland',
        'S6': '/travelnews/northernireland',
        'D7': '/travelnews/birmingham',
        'D8': '/travelnews/tyne',
        'D9': '/travelnews/london',
        'U4': '/travelnews/glasgowandwestscotland',
        'U8': '/travelnews/edinburghandeastscotland',
        'U5': '/travelnews/edinburghandeastscotland',
        'U6': '/travelnews/edinburghandeastscotland',
        'W8': '/travelnews/highlandsandislands',
        'E3': '/travelnews/london',
        'U7': '/travelnews/glasgowandwestscotland',
        'E1': '/travelnews/humber',
        'E4': '/travelnews/essex',
        'E2': '/travelnews/essex',
        'U9': '/travelnews/taysideandcentralscotland',
        'S2': '/travelnews/northernireland',
        'V1': '/travelnews/edinburghandeastscotland',
        'Y1': '/travelnews/northeastwales',
        'E5': '/travelnews/tyne',
        'V2': '/travelnews/glasgowandwestscotland',
        'E6': '/travelnews/gloucestershire',
        'E7': '/travelnews/london',
        'Y2': '/travelnews/northwestwales',
        'E9': '/travelnews/liverpool',
        'F2': '/travelnews/hampshire',
        'F6': '/travelnews/london',
        'E8': '/travelnews/london',
        'F7': '/travelnews/herefordandworcester',
        'F9': '/travelnews/london',
        'V3': '/travelnews/taysideandcentralscotland',
        'F1': '/travelnews/london',
        'G1': '/travelnews/london',
        'F5': '/travelnews/tyne',
        'F8': '/travelnews/threecounties',
        'F4': '/travelnews/london',
        'F3': '/travelnews/london',
        'G2': '/travelnews/hampshire',
        'G3': '/travelnews/london',
        'V4': '/travelnews/glasgowandwestscotland',
        'G4': '/travelnews/london',
        'G5': '/travelnews/kent',
        'G6': '/travelnews/humber',
        'G8': '/travelnews/humber',
        'G7': '/travelnews/london',
        'G9': '/travelnews/manchester',
        'H2': '/travelnews/lancashire',
        'H1': '/travelnews/london',
        'H4': '/travelnews/leicester',
        'H3': '/travelnews/leeds',
        'H5': '/travelnews/leicester',
        'H6': '/travelnews/london',
        'H7': '/travelnews/lincolnshire',
        'H8': '/travelnews/liverpool',
        'S4': '/travelnews/northernireland',
        'H9': '/travelnews/london',
        'S3': '/travelnews/northernireland',
        'S5': '/travelnews/northernireland',
        'I1': '/travelnews/threecounties',
        'I2': '/travelnews/manchester',
        'I5': '/travelnews/tees',
        'I3': '/travelnews/kent',
        'S7': '/travelnews/northernireland',
        'I6': '/travelnews/threecounties',
        'V5': '/travelnews/edinburghandeastscotland',
        'Y4': '/travelnews/southeastwales',
        'I4': '/travelnews/london',
        'V6': '/travelnews/highlandsandislands',
        'Y3': '/travelnews/southeastwales',
        'S8': '/travelnews/northernireland',
        'V7': '/travelnews/glasgowandwestscotland',
        'J6': '/travelnews/tyne',
        'T2': '/travelnews/northernireland',
        'J2': '/travelnews/lincolnshire',
        'I7': '/travelnews/tyne',
        'I9': '/travelnews/norfolk',
        'J8': '/travelnews/nottingham',
        'V8': '/travelnews/glasgowandwestscotland',
        'J3': '/travelnews/lincolnshire',
        'J4': '/travelnews/somerset',
        'T1': '/travelnews/northernireland',
        'J1': '/travelnews/northampton',
        'Y5': '/travelnews/southwestwales',
        'J9': '/travelnews/nottingham',
        'J5': '/travelnews/tyne',
        'I8': '/travelnews/london',
        'Y6': '/travelnews/southeastwales',
        'J7': '/travelnews/york',
        'S9': '/travelnews/northernireland',
        'K1': '/travelnews/manchester',
        'T3': '/travelnews/northernireland',
        'V9': '/travelnews/highlandsandislands',
        'K2': '/travelnews/oxford',
        'Y7': '/travelnews/southwestwales',
        'W1': '/travelnews/taysideandcentralscotland',
        'K4': '/travelnews/devon',
        'K5': '/travelnews/dorset',
        'K6': '/travelnews/hampshire',
        'Y8': '/travelnews/midwales',
        'K3': '/travelnews/cambridgeshire',
        'K9': '/travelnews/tees',
        'L2': '/travelnews/manchester',
        'Y9': '/travelnews/southeastwales',
        'K8': '/travelnews/london',
        'K7': '/travelnews/berkshire',
        'W2': '/travelnews/glasgowandwestscotland',
        'L1': '/travelnews/london',
        'L3': '/travelnews/sheffield',
        'L4': '/travelnews/northampton',
        'L7': '/travelnews/birmingham',
        'W4': '/travelnews/glasgowandwestscotland',
        'T9': '/travelnews/southscotland',
        'N5': '/travelnews/suffolk',
        'L8': '/travelnews/liverpool',
        'M6': '/travelnews/bristol',
        'L9': '/travelnews/sheffield',
        'N1': '/travelnews/liverpool',
        'L6': '/travelnews/shropshire',
        'N2': '/travelnews/manchester',
        'L5': '/travelnews/manchester',
        'M1': '/travelnews/berkshire',
        'W5': '/travelnews/glasgowandwestscotland',
        'N6': '/travelnews/tyne',
        'M2': '/travelnews/birmingham',
        'M3': '/travelnews/somerset',
        'M5': '/travelnews/essex',
        'N7': '/travelnews/surrey',
        'T4': '/travelnews/northernireland',
        'N4': '/travelnews/stoke',
        'W6': '/travelnews/taysideandcentralscotland',
        'M4': '/travelnews/hampshire',
        'N8': '/travelnews/surrey',
        'M9': '/travelnews/stoke',
        'N3': '/travelnews/tees',
        'M7': '/travelnews/tyne',
        'Z1': '/travelnews/southwestwales',
        'N9': '/travelnews/wiltshire',
        'M8': '/travelnews/london',
        'O1': '/travelnews/glasgowandwestscotland',
        'O2': '/travelnews/shropshire',
        'O3': '/travelnews/essex',
        'O4': '/travelnews/devon',
        'Z2': '/travelnews/southwestwales',
        'O6': '/travelnews/manchester',
        'O5': '/travelnews/london',
        'Z3': '/travelnews/southeastwales',
        'P3': '/travelnews/coventry',
        'P4': '/travelnews/berkshire',
        'W7': '/travelnews/southeastwales',
        'O9': '/travelnews/london',
        'P7': '/travelnews/manchester',
        'P8': '/travelnews/wiltshire',
        'O7': '/travelnews/leeds',
        'O8': '/travelnews/birmingham',
        'W9': '/travelnews/edinburghandeastscotland',
        'Q3': '/travelnews/birmingham',
        'P1': '/travelnews/london',
        'P9': '/travelnews/berkshire',
        'Q2': '/travelnews/berkshire',
        'Q4': '/travelnews/herefordandworcester',
        'Q1': '/travelnews/liverpool',
        'P2': '/travelnews/manchester',
        'Z4': '/travelnews/northeastwales',
        'P5': '/travelnews/london',
        'P6': '/travelnews/sussex',
        'Q5': '/travelnews/york',
        'W3': '/travelnews/northeastscotland',
    };




    var geonameUrl = 'http://api.geonames.org/countrySubdivision?lat=' + lat + '&lng=' + lng + '&level=4&username=mdgardiner';

    console.log('GEONAMES REQUEST: ' + geonameUrl);

    var geonamesRequest = restler.get(geonameUrl);
    
    geonamesRequest.on('complete', function(geonameResult, response){

        console.log('GEONAMES REQUEST complete - Status Code: ' + response.statusCode);

        if (geonameResult instanceof Error) {

            console.log('Error: ' + geonameResult.message);

        } else {

            console.log('result: ' + geonameResult);

            var parser = new xml2js.Parser();

            var countyName = '';

            parser.parseString(geonameResult, function (err, parseResult){
                if(parseResult != null && parseResult.countrySubdivision != undefined){
                    countyName = parseResult.countrySubdivision.adminCode2;
                    
// should use adminCode2 instead and lookup three letter codes
                }
            });
            
            console.log('County Code: ' + countyName);
            
            var target = lookupData[countyName];

            if ( target != '' && target != undefined ) {

                var travelUrl = 'http://www.bbc.co.uk' + target + '.json';

                console.log('TRAVEL API REQUEST: ' + travelUrl);

                var travelRequest = restler.get(travelUrl);

                travelRequest.on('complete', function(travelResult, response){

                    console.log('TRAVEL API REQUEST complete - Status Code: ' + response.statusCode);

                    if (travelResult instanceof Error) {

                        console.log('Error: ' + travelResult.message);
                        res.render('no-travel');

                    } else {

                        console.log('result: ' + travelResult);

                        //res.json(travelResult);
                        res.render('travel', travelResult);

                    }

                });

            } else {
                console.log('County (' + countyName + ') not mapped');
                res.render('no-travel');
                
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

