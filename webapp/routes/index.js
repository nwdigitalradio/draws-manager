var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
var amixer = [];

//var controls = new Array(1,9,40,33,36,34,39,29,37,32,41,30,5,3,25,28,10);
var controls = new Array('1','9','40','33','36','34','39','29','37','32','41','30','5','3','25','28','10');

function arr2ele(arr) {
	element = {};
	for (j=0 ; j < arr.length ; j ++) {
		[name, val] = arr[j].split(/=/);
		element[name] = val;
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
			if (i > 0 && controls.includes(element.specs.numid)) amixer.push(element);
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
		}

	}
	if (controls.includes(element.specs.numid)) amixer.push(element);
});

/* GET home page. */
router.get('/', function(req, res, next) {
//	console.log(JSON.stringify(amixer,null,4));
	res.render('index', { layout: 'layout', controls: controls, title: 'DRAWS™ Manager', mixer: amixer});
});


module.exports = router;

