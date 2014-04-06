var fs = require('fs');

var hdb    = require('hdb');
var client = hdb.createClient({
  host     : '...',
  port     : 30015,
  user     : '...',
  password : '...'
});

exports.helloWorld = function(req, res){
        res.send('Hello World!');
    }
    
exports.getRoutes = function(req, res) {
    var service = req.params.service;
    var table;
    
    switch (service) {
        case 'DUBLINBUS':
            table = 'select "route_id","route_short_name","route_long_name" from "SAP_DCODE"."NEWDUBLINBUSROUTES"';
        break;
        default: table = 'select ROUTEID,ROUTESHORTNAME,ROUTELONGNAME from "SAP_DCODE"."sap.DCODE.data::DCODE.M_'+service+'ROUTES"';
    }
    
    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      } 
      client.exec(table, function (err, rows) {
        if (err) {
          res.send('Execute error:', err);
        }
        res.send(rows);  
      });
    });
}

exports.getStops = function(req, res) {
    var service = req.query.service;
    var route = req.query.route;
    var direction = req.query.direction || 0;
    var sqlStmt;
    
    switch (service) {
        case 'DUBLINBUS':
            var sqlStmt_o = 'SELECT T3."stop_id", "stop_name" FROM "SAP_DCODE"."NEWDUBLINBUSTRIPS" AS T1 JOIN "SAP_DCODE"."NEWDUBLINBUSSTOPTIMES" AS T2 ON T1."trip_id"=T2."trip_id" AND "route_id" = \''+route+'\' JOIN "SAP_DCODE"."NEWDUBLINBUSSTOPS" AS T3 ON T2."stop_id"=T3."stop_id" GROUP BY T3."stop_id", T3."stop_name"';
            sqlStmt = 'SELECT * FROM (SELECT T3."stop_id", "stop_name", T1."direction_id", T1."trip_headsign" FROM "SAP_DCODE"."NEWDUBLINBUSTRIPS" AS T1 JOIN "SAP_DCODE"."NEWDUBLINBUSSTOPTIMES" AS T2 ON T1."trip_id"=T2."trip_id" AND "route_id" = \''+route+'\' AND "direction_id"= \''+direction+'\' JOIN "SAP_DCODE"."NEWDUBLINBUSSTOPS" AS T3 ON T2."stop_id"=T3."stop_id" GROUP BY T3."stop_id", T3."stop_name", T1."direction_id", T1."trip_headsign") ORDER BY "stop_id"';
        break;
        default: sqlStmt = 'SELECT T3.STOPID, T3.STOPNAME FROM "SAP_DCODE"."sap.DCODE.data::DCODE.M_'+service+'TRIPS" AS T1 JOIN "SAP_DCODE"."sap.DCODE.data::DCODE.M_'+service+'STOPTIMES" AS T2 ON T1.TRIPID=T2.TRIPID AND ROUTEID = \''+route+'\' JOIN "SAP_DCODE"."sap.DCODE.data::DCODE.M_'+service+'STOPS" AS T3 ON T2.STOPID=T3.STOPID GROUP BY T3.STOPID, T3.STOPNAME';
    }
    
    
     client.connect(function (err) {
       if (err) {
         return console.error('Connect error', err);
       } 
       client.exec(sqlStmt, function (err, rows) {
         if (err) {
           res.send('Execute error:', err);
         }
         res.send(rows);  
       });
     });
    
    //load mockdata
    /*var file = __dirname + '/../mockdata/stops.json';
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }
     
      data = JSON.parse(data);
     
      res.send(data);
    });*/
}

exports.getDuration = function(req, res) {
    var service = req.query.service;
    var route = req.query.route;
    var start = req.query.start;
    var stop = req.query.stop;
    var day = req.query.day;
    var time = req.query.time;
    
    var service_id = req.query.service_id;
    
    var sqlStmt = 'select "hour", ROUND(avg("duration"),1) as "avg_duration" from (select "trip_id",hour("arrival_time") as "hour",max(hour("arrival_time")*60+minute("arrival_time"))-min(hour("arrival_time")*60+minute("arrival_time")) as "duration" from (select b.* from "SAP_DCODE"."NEWDUBLINBUSTRIPS"  as a inner join "SAP_DCODE"."NEWDUBLINBUSSTOPTIMES" as b on a."trip_id"=b."trip_id" where a."route_id"=\''+route+'\'  AND a."service_id"=\''+service_id+'\' order by a."trip_id", b."stop_sequence") where "stop_id"=\''+start+'\' OR "stop_id"=\''+stop+'\' group by "trip_id", hour("arrival_time") having count(*)>1 order by hour("arrival_time")) group by "hour"';
    
    client.connect(function (err) {
       if (err) {
         return console.error('Connect error', err);
       } 
       client.exec(sqlStmt, function (err, rows) {
         if (err) {
           res.send('Execute error:', err);
         }
         res.send(rows);  
       });
     });
    
    //load mockdata
    /*var file = __dirname + '/../mockdata/duration.json';
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }
     
      data = JSON.parse(data);
     
      res.send(data);
    });*/
}

exports.getMock = function(req, res) {
    var filename = req.params.file
    
    //load mockdata
    var file = __dirname + '/../mockdata/gtfs/'+filename;
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }
     
      data = JSON.parse(data);
     
      res.send(data);
    });
}