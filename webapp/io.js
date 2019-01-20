var io = require('socket.io')();
var express = require('express');
var fs = require('fs');
const exec = require('child_process').execSync;
const Amixer = require('./amixer.js');
const MixerState = require('./mixerState');
let mixer = new Amixer();
let radios = JSON.parse(fs.readFileSync('./radios.json').toString());
console.log("Radios: " + JSON.stringify(radios,null,4));

let thermFile = '/sys/class/thermal/thermal_zone0/temp';
let systemstatseconds = 20 * 1000;
let systemstats = {};
let controlnames = new Array();
	controlnames[1] = 'PCM';
	controlnames[2] = 'DAC Left Playback PowerTune';
	controlnames[3] = 'DAC Right Playback PowerTune';
	controlnames[5] = 'LO Driver Gain';
	controlnames[7] = 'LO DAC';
	controlnames[8] = 'LO Playback Common Mode';
	controlnames[12] = 'ADC Level';
	controlnames[28] = 'LOL Output Mixer L_DAC';
	controlnames[31] = 'LOR Output Mixer R_DAC';
	controlnames[32] = 'IN1_R to Right Mixer Positive Resistor';
	controlnames[33] = 'IN2_R to Right Mixer Positive Resistor';
	controlnames[36] = 'CM_R to Right Mixer Negative Resistor';
	controlnames[39] = 'IN1_L to Left Mixer Positive Resistor';
	controlnames[40] = 'IN2_L to Left Mixer Positive Resistor';
	controlnames[43] = 'CM_L to Left Mixer Negative Resistor';

function trimNull(a) {
  var c = a.indexOf('\0');
  if (c>-1) {
    return a.substr(0, c);
  }
  return a;
}

function getSensors() {
	let senbuf = exec('/usr/bin/sensors');
	let lines = senbuf.toString().split(/\r?\n/);
	let sensors = [];
	for (let i=0; i < lines.length; i++) {
		let line = lines[i];
		if (line.includes(':')) {
			[key,val] = line.split(/:/);
			sensors.push({label:key,value:val.trim()});
		}
	}
	return sensors;
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

systemstats['hat'] =  hatRead();
systemstats['model'] = getModel();

function getStats(){
	return systemstats;
}

function sysstats(socket) {
        io.emit("systemstats", systemstats);
//	console.log('systats ' + JSON.stringify(systemstats,null,4));
}


setInterval(function () {
	let ms = new MixerState();
	mixer.setState(ms.limited());
	systemstats['mixer'] = mixer;
	systemstats['sensors'] = getSensors();
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
},1000);



io.on('connection', function(socket) {
//	socket.emit({"mixerstate":new MixerState()});
	socket.on('sset', function(data) { 
		let command = "/usr/bin/amixer -c udrc sset '" + controlnames[data.control] + "' '"
			+ data.value + "'";
		console.log(command);
		exec(command);
	});
	socket.on('execute', function(data) {
		let cmd = "";
		switch(data.value) {
			case 1:
				cmd = "sudo systemctl restart gpsd";
				break;
			case 2:
				cmd = "sudo systemctl stop gpsd";
				break;
			case 3:
				cmd = "sudo chronyc makestep";
				break;
			default:
				cmd = "echo execute " + JSON.stringify(data);
				break;
		}
		console.log('Eexecuting: ' + cmd);
		console.log(exec(cmd).toString());
		console.log('done');
	});

	sysstats(socket);
	console.log(JSON.stringify(systemstats.mixer,null,4));
	io.emit("radios",radios);
	setInterval(function() {sysstats(socket)},1000);

});

io.controls = new MixerState().limited();
io.systemstats = getStats();
module.exports = io;
