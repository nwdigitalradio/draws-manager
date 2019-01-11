var io = require('socket.io')();
var express = require('express');
var fs = require('fs');
const exec = require('child_process').execSync;
const readline = require('readline');
const Amixer = require('./amixer.js');
var mixer = new Amixer();

var thermFile = '/sys/class/thermal/thermal_zone0/temp';
var systemstatseconds = 20 * 1000;
var systemstats = {};
let amixer = new Array();
var controlleft = [1,2,5,7,12,28,39,40,43]; // 4,9,10,13,14,15,17,18,19,20,21,22,23,24,25,26,27,37
var controlright = [1,3,5,7,12,31,32,33,36]; // 4,9,11,13,14,16,17,18,19,20,21,22,23,24,25,29,30,42,44,45
var controlcommon = [8]; // 6,25

Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j]) a.splice(j--, 1);
		}
	}
	return a;
};

var controls = controlleft.concat(controlright.concat(controlcommon)).unique().sort(function(a, b){return a - b});

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
//	console.log('systats ' + JSON.stringify(systemstats,null,4));
}

systemstats['hat'] =  hatRead();
systemstats['model'] = getModel();

function getStats(){
	return systemstats;
}

function getControls(){
	return controls;
}


setInterval(function () {
	systemstats['amixer'] = readAmixer();
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
	sysstats(socket);
	setInterval(function() {sysstats(socket)},systemstatseconds);
});


function arr2ele(arr) {
	element = {};
	for (j=0 ; j < arr.length ; j ++) {
		[key, val] = arr[j].split(/=/);
		element[key.trim().replace(/-/,'_')] = val.trim();
	}
	return element;
}

function readAmixer() {
	var amixerout = exec('/usr/bin/amixer -c udrc contents').toString();
	
		amixer = [];

		lines = amixerout.split(/\r?\n/);
		var element = {};
		for (i=0 ; i < lines.length ; i++) {
			proto = lines[i].trim();
			if (proto.startsWith("numid")) {
				if (i > 0) {
					var id = parseInt(element.specs.numid);
					if (controls.includes(id)) {
						if (element.params.values === "2") {
							[element.curleft,element.curright] 
								= element.curvalues.split(/,/);
						}
						if (controlleft.includes(id)) {
							let leftelement = JSON.parse(JSON.stringify(element));
							leftelement.group = 'left';
							amixer.push(leftelement);
							// console.log(id + " " + leftelement.group);
						}
						if (controlright.includes(id)) {
							let rightelement = JSON.parse(JSON.stringify(element));
							rightelement.group = 'right';
							amixer.push(rightelement);
							// console.log(id + " " + rightelement.group);
						}
						if (controlcommon.includes(id)) {
							element.group = 'common';
							amixer.push(element);
							// console.log(id + " " + element.group);
						}
					}
				}
				element = {};
				element.specs = arr2ele(proto.split(/,/));
			}
	
			if (proto.startsWith("; type")) {
				element.params = arr2ele(proto.slice(2).split(/,/));
			}
	
			if (proto.startsWith("; Item")) {
				item = proto.slice(8).replace(' ',',');
				[num,val] = item.split(/,/);
				if (!element.params.itemlist) element.params.itemlist = new Array();
				element.params.itemlist.push({'value':num,'label':val});
			}
	
			if (proto.startsWith(": values")) {
				[name,val] = proto.split(/=/);
				element.curvalues = val;
			}
	
			if (proto.startsWith("|")) {
				element.comments = arr2ele(proto.slice(2).split(/,/));
				if (element.comments.dBscale_min) {
					var start = parseFloat(element.comments.dBscale_min.replace(/dB/,''));
					var step = parseFloat(element.comments.step.replace(/dB/,''));
					element.dbSteps = [];
					
					for (j = element.params.min; j <= element.params.max; j++) {
						element.dbSteps[j] = start + (step * parseFloat(j));
					}
				}
			}
		}
	mixer.setState(amixer);
	return amixer;
}
io.amixer = readAmixer();
io.controls = getControls();
io.systemstats = getStats();
module.exports = io;
