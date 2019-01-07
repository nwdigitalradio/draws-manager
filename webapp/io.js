var io = require('socket.io')();
var fs = require('fs');
var thermFile = '/sys/class/thermal/thermal_zone0/temp';
var systemstatseconds = 60 * 1000;
var systemstats = {};

function trimNull(a) {
  var c = a.indexOf('\0');
  if (c>-1) {
    return a.substr(0, c);
  }
  return a;
}

function getModel() {
        var mod = '';
        var modelfile = "/proc/device-tree/model";
        if (fs.existsSync(modelfile)) {
                var model = fs.readFileSync(modelfile).toString();
                mod = trimNull(model);
        }
        return mod;
}

function hatRead() {
        var path = "/proc/device-tree/hat";
        var hat = {};
        if (fs.existsSync(path)) {
                var items = fs.readdirSync(path);
                for (var i=0; i<items.length; i++) {
                        var filename = path + "/" + items[i];
                        var value = fs.readFileSync(filename).toString().trim();
                        hat[items[i]] = trimNull(value);
                }
        }
        return hat;
}


var SecondsTohhmmss = function(totalSeconds) {
        var days = Math.floor(totalSeconds / 86400);
        var used = days * 86400;
        var hours = Math.floor((totalSeconds - used) / 3600);
        used += hours * 3600;
        var minutes = Math.floor((totalSeconds - used) / 60);
        used += minutes * 60;
        var seconds = totalSeconds - used;

        seconds = Math.floor(seconds);
        var result = {}
        result['days'] = days;
        var hms = (hours < 10 ? "0" + hours : hours);
        hms += ":" + (minutes < 10 ? "0" + minutes : minutes);
        hms += ":" + (seconds < 10 ? "0" + seconds : seconds);
        result['hms'] = hms;
        return result;
}


function sysstats(socket) {
        socket.broadcast.emit("systemstats", systemstats);
//	console.log('systats');
}

setInterval(function () {
	systemstats['model'] = getModel();
	systemstats['hat'] = hatRead();
	fs.readFileSync("/proc/uptime").toString().split('\n').forEach( function(line) {
		if (line.trim().length > 0) {
			var timex = line.split(" ");
			systemstats['uptime'] = SecondsTohhmmss(timex[0]);
		}
	});
	fs.readFileSync("/proc/loadavg").toString().split('\n').forEach( function(line) {
		if (line.trim().length > 0) {
			var la = line.split(" ");
			var loadavg = {};
			loadavg["one"] = la[0];
			loadavg["five"] = la[1];
			loadavg["fifteen"] = la[2];
			systemstats['loadavg'] = loadavg;
		}
	});
	if (fs.existsSync(thermFile)) {
		fs.readFileSync(thermFile).toString().split('\n').forEach( function(line) {
			if (line.trim().length > 0) {
				var cputemp = {};
				var temps = line.split(" ");
				var centigrade = temps[0] / 1000;
				var fahrenheit = (centigrade * 1.8) + 32;
				cputemp['c'] = Math.round(centigrade * 100) / 100;
				cputemp['f'] = Math.round(fahrenheit * 100) / 100;
				systemstats['cputemp'] = cputemp;
			}
        	});
	}
        systemstats['timestamp'] = new Date().getTime();
//	console.log('capture');
},1000);


io.on('connection', function(socket) {
	// console.log("Connected: ",socket);
	sysstats(socket);
//	socket.on('connect', function(msg){ console.log(msg); });
	setInterval(function() {sysstats(socket)},systemstatseconds);
});


module.exports = io;
