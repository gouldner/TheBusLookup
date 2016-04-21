var fs = require('fs');
var xml = require('xml2js');
var http= require('http');

var configFile = 'config.json';

var configuration = JSON.parse(
    fs.readFileSync(configFile)
);

var key = configuration.key;
var stops = configuration.stops;

var util = require('util');


var main = function() {
  // 983 sinclair circle
  // 413 university and metcalf
  // 214 Kalanianaole Hwy + Laukahi St Westbound 
  // 255 Kalanianaole Hwy + Waiholo St Eastbound
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

      console.log("Route " + arrival.route + " heading to "
                  + arrival.headsign + " arriving at "
                  + arrival.stopTime + "("
                  + arrival.estimated + ")"
                  );
    });
  });

};


main();
