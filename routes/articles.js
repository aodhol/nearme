var restler = require('restler');

var async = require('async');

//require('express-helpers').all


function swapPairs(array){

    for(var i = 0; i < array.length; i+=2){
         var tmp = array[i];
         array[i] = array[i+1]
         array[i+1] = tmp;
    }

    return array;
}

exports.find_by_polygon_points = function(req,res){
    
    var points = req.params.points;

    points = points.split(/\s|,/);

    //Swap lat / lon pairs if necessary as API may differ to Google ordering?
    //points = swapPairs(points);

    points = points.join(' ');

    console.log({
        'data':
        '?thing omgeo:within(' + points + ') . ?url <http://data.press.net/ontology/tag/about> ?thing . ?url <http://purl.org/dc/terms/publisher> <http://www.bbc.co.uk/news/> .'
    });

    var request = restler.post('http://juicer.responsivenews.co.uk/api/articles.json?binding=url&limit=50',{'data':
        '?thing omgeo:within(' + points + ') . ?url <http://data.press.net/ontology/tag/about> ?thing . ?url <http://purl.org/dc/terms/publisher> <http://www.bbc.co.uk/news/> .'
    });

    request.on('complete', function(data,response) {

            console.log('Request on complete');

            if(response.statusCode !== 200){
                console.log("Non 200 response: " + response.statusCode);
            }else{
                //var results = JSON.parse(data); 
               // populateArticlesForSection(section,results.articles);
                //callback(null,results.articles);
                res.json(JSON.parse(data));
            }

        });

        request.on('error',function(err){
            console.log("ERROR" + err.toString());
        });

}

exports.find_by_coordinates = function(req, res){


     /*
     1. Translate postcode to lat lon.
     2. Use lat lon in sparql query.
     3. Display news stories.
     */


     var distance = parseInt(req.params.distance) || 30;
     var limit = parseInt(req.params.limit) || 10;
     var orderby = req.params.orderby || 'distance';

     var lat = req.params.lat;
     var lon = req.params.lon;

     var allSections = ["Africa","Also in the News","Asia","Asia Business","Asia-Pacific","Athletics","Basketball","BBC Mundo","BBC Parliament","Beds, Herts &amp; Bucks","Berkshire","Birmingham &amp; Black Country","Black country","Boxing","Bradford","Bristol","Business","Business of Sport","Cambridgeshire","China","Click","Cornwall","Country profiles","Coventry &amp; Warwickshire","Cricket","Cumbria","Cycling","Dachaigh","Darts","Derby","Devon","Disability sport","Dorset","Edinburgh, Fife &amp; East Scotland","Education &amp; Family","England","Entertainment","Entertainment &amp; Arts","Essex","Euro 2012","Europe","Features","Football","Formula 1","Foyle &amp; West","Glasgow &amp; West Scotland","Gloucestershire","Golf","Guernsey","Gwleidyddiaeth","Hafan","Hampshire &amp; Isle of Wight","HARDtalk","Have Your Say","Health","Help","Hereford &amp; Worcester","Highlands &amp; Islands","Home","Horse Racing","House of Commons","Humberside","India","In Pictures","Institution guides","Isle Of Man / Ellan Vannin","Isle of Man Video &amp; Audio","Jersey","Kent","Lancashire","Latin America &amp; Caribbean","Leeds &amp; West Yorkshire","Leicester","Lincolnshire","Liverpool","London","Magazine","Manchester","Middle East","Mid Wales","MotoGP","Music","NE Scotland, Orkney &amp; Shetland","News","N. Ireland Politics","Norfolk","Northampton","North East Wales","Northern Ireland","North West Wales","North Yorkshire","Nottingham","Olympics","Oxford","Rugby League","Rugby Union","Science &amp; Environment","Scotland","Scotland business","Scotland politics","Sheffield &amp; South Yorkshire","Shropshire","Snooker","Somerset","South Asia","South East Wales","South Scotland","South West Wales","Stoke &amp; Staffordshire","Suffolk","Surrey","Sussex","Tayside and Central Scotland","Technology","Tees","Tennis","Today","Tyne and Wear","Tyne &amp; Wear","UK","UK Politics","UK troops in Afghanistan","US and Canada","US &amp; Canada","Video","Video &amp; Audio","Wales","Wales politics","Wear","Wiltshire","Winter Sports","World","World Radio and TV","York &amp; North Yorkshire","Your Money"];

     var sportSections = [];

     var userSections = ["UK Politics","Africa","Also in the News","Asia","Asia Business","Asia-Pacific", "Health"];

     var sections = ((req.params.sections !== undefined) ? [req.params.sections] : allSections);

     //var request = restler.get('http://juicer.responsivenews.co.uk/articles.json?limit=' + limit + '&distance=' + distance + '&location=' + lat + ',' + lon + '&orderby=' + orderby);

     var sectionArticles = [];

    function callRestService(url,param,section,callback){

        var request = restler.post(url,param);

        request.on('complete', function(data,response) {

            //@todo: check for valid content type.
            //var contentType = response.getHeader('content-type');
        

            console.log('Request on complete');

            if(response.statusCode !== 200){
                //Deal with errors
                //res.json({});



                console.log('Satus code:' + response.statusCode);

                callback(null,null);
            }else{
                var results = JSON.parse(data); 
                populateArticlesForSection(section,results.articles);
                callback(null,results.articles);
            }

        });

        request.on('error',function(err){
            callback(err,null);
            console.log("ERROR" + err.toString());
        });
    }

    function populateArticlesForSection(section,articles){   
        console.log("Populating:" + section + " " + articles.length  + " articles");

        if(articles != undefined){
            sectionArticles[section] = articles;
        }
    }


    /*function createQueryClause(subject,predicate,object){

    }


    function buildQuery(){


        createQueryClause('?thing)

        '?thing omgeo:nearby("' + lat + '" "' + lon + '" "' + distance + 'mi") . 
        ?url <http://data.press.net/ontology/tag/about> ?thing . 
        ?url <http://purl.org/dc/terms/subject> "'+ section +'"@en . 
        ?url <http://purl.org/dc/terms/publisher> <http://www.bbc.co.uk/news/> .'
    }*/

    var invocations = [];

    //Construct invocation callbacks.
    for(var i = 0; i < sections.length; i++){

        var section = sections[i];


        //Closure to capture current scope.
        (function(section,lat,lon,distance){



        console.log("Query:" + 'http://juicer.responsivenews.co.uk/api/articles.json?binding=url&limit=50',
                {'data':
                '?thing omgeo:nearby("' + lat + '" "' + lon + '" "' + distance + 'mi") . ?url <http://data.press.net/ontology/tag/about> ?thing . ?url <http://purl.org/dc/terms/subject> "'+ section +'"@en . ?url <http://purl.org/dc/terms/publisher> <http://www.bbc.co.uk/news/> .'
                });

            invocations.push(function(callback){callRestService('http://juicer.responsivenews.co.uk/api/articles.json?binding=url&limit=50',
                {'data':
                '?thing omgeo:nearby("' + lat + '" "' + lon + '" "' + distance + 'mi") . ?url <http://data.press.net/ontology/tag/about> ?thing . ?url <http://purl.org/dc/terms/subject> "'+ section +'"@en . ?url <http://purl.org/dc/terms/publisher> <http://www.bbc.co.uk/news/> .'
                },section,callback
            )});
        })(section,lat,lon,distance);

    }

    //For every section, invoke a request to the api.
    async.parallel(invocations, function(){

        console.log("All requests completed");

        res.render('story-list',{'sections':sections,'articles':sectionArticles});

    });

};

exports.find_by_postcode = function(req, res){
 /*
 1. Translate postcode to lat lon.
 2. Use lat lon in sparql query.
 3. Display news stories.
 */
};

