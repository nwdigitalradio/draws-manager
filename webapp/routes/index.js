var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
var amixer = [];
const stats = require('../io.js').systemstats;

Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j]) a.splice(j--, 1);
		}
	}
	return a;
};


var controlleft = [1,2,5,12,28,39,40,43]; // 4,9,10,13,14,15,17,18,19,20,21,22,23,24,25,26,27,37
var controlright = [1,3,5,12,31,32,33,36]; // 4,9,11,13,14,16,17,18,19,20,21,22,23,24,25,29,30,42,44,45
var controlcommon = [7,8]; // 6,25
var controls = controlleft.concat(controlright.concat(controlcommon)).unique().sort(function(a, b){return a - b});

function arr2ele(arr) {
	element = {};
	for (j=0 ; j < arr.length ; j ++) {
		[key, val] = arr[j].split(/=/);
		element[key.trim().replace(/-/,'_')] = val.trim();
	}
	return element;
}


exec('/usr/bin/amixer -c udrc contents', (err, stdout, stderr) => {

	amixer = [];
	if (err) {
		console.error(err);
		return;
	}
	lines = stdout.split(/\r?\n/);
	var element = {};
	for (i=0 ; i < lines.length ; i++) {
		proto = lines[i].trim();
		if (proto.startsWith("numid")) {
			// if (i > 0 && controls.includes(id)) {
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
						console.log(id + " " + leftelement.group);
					}
					if (controlright.includes(id)) {
						let rightelement = JSON.parse(JSON.stringify(element));
						rightelement.group = 'right';
						amixer.push(rightelement);
						console.log(id + " " + rightelement.group);
					}
					if (controlcommon.includes(id)) {
						element.group = 'common';
						amixer.push(element);
						console.log(id + " " + element.group);
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
	// console.log(JSON.stringify(amixer,null,4));
});

/* GET home page. */
router.get('/', function(req, res, next) {
//	console.log(JSON.stringify(amixer,null,4));
	res.render('index', { layout: 'layout', controls: controls, title: 'DRAWS™ Manager', mixer: amixer, stats: stats});
});


module.exports = router;

