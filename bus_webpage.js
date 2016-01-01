var fs = require('fs');
var xml = require('xml2js');
var http= require('http');
var express = require('express');
var app = express();

var key = '';
var routes = {};

var util = require('util');


var main = function() {
  // 983 sinclair circle
  // 413 university and metcalf
  var stops = ['983', '413'];
  for (var i = 0; i < stops.length; i++) {
    var id = stops[i];
    getSchedule(id);
  }
};


var getSchedule = function(stopId) {

  var url = 'http://api.thebus.org/arrivals/?key=' + key + '&stop=' + stopId;

  http.get(url, function(res) {
      res.setEncoding('utf8');
      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });

      res.on('end', function() {
        routes = {};
        processXml(body);
        console.log("here: " + util.inspect(routes, false, null));
      });

  }).on('error', function(e) {
      console.log("Got error: " + e.message);
  });

};


var processXml = function(data) {
  var parser = new xml.Parser();

  parser.parseString(data, function (err, result) {
    console.log(result.stopTimes.stop + " - " + result.stopTimes.timestamp );
    result.stopTimes.arrival.forEach(function(arrival,i) {
      if (routes[arrival.route]) {
        if (routes[arrival.route].length <= 4) {
          routes[arrival.route].push(arrival.stopTime[0]);
        }
      } else {
          routes[arrival.route] = arrival.stopTime;
      }

      console.log(arrival.route + " - "
                  + arrival.headsign + " at "
                  + arrival.stopTime + "("
                  + arrival.estimated + ")"
                  );
    });
  });

};

app.get('/', function(request, response){
    response.sendfile('RonsBusStops.html');
});

main();
