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

            if ( target != '' ) {
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

