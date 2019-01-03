var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
var amixer = [];

var controls = new Array('1','9','40','33','36','34','39','29','37','32','41','30','5','3','25','28','10','2','3','8');

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
			if (i > 0 && controls.includes(element.specs.numid)) {
				if (element.params.values === "2") {
					[element.curleft,element.curright] 
						= element.curvalues.split(/,/);
				}
				amixer.push(element);
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
	if (controls.includes(element.specs.numid)) {
		if (element.params.values === "2") {
			[element.curleft,element.curright] = element.curvalues.split(/,/);
		}
		amixer.push(element);
	}
	console.log(JSON.stringify(amixer,null,4));
});

/* GET home page. */
router.get('/', function(req, res, next) {
//	console.log(JSON.stringify(amixer,null,4));
	res.render('index', { layout: 'layout', controls: controls, title: 'DRAWS™ Manager', mixer: amixer});
});


module.exports = router;

