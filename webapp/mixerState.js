const exec = require('child_process').execSync;

Array.prototype.unique = function() {
	let a = this.concat();
	for(let i=0; i<a.length; ++i) {
		for(let j=i+1; j<a.length; ++j) {
			if(a[i] === a[j]) a.splice(j--, 1);
		}
	}
	return a;
};

function arr2ele(arr) {
	element = {};
	for (let j=0 ; j < arr.length ; j ++) {
		[key, val] = arr[j].split(/=/);
		element[key.trim().replace(/-/,'_')] = val.trim();
	}
	return element;
}

class MixerState {
	constructor (device) {
		let amixerout = exec('/usr/bin/amixer -c udrc contents').toString();
		let lines = amixerout.split(/\r?\n/);
		let amixer = [];
		let element = {};
		for (let i=0 ; i < lines.length ; i++) {
			let proto = lines[i].trim();
			if (proto.startsWith("numid")) {
				if (i > 0) {
					if (element.params.values === "2") [element.curleft,element.curright] = element.curvalues.split(/,/);
					amixer.push(element);
					element = {};
				}
				element.specs = arr2ele(proto.split(/,/));
				element.id = parseInt(element.specs.numid);
			}
	
			if (proto.startsWith("; type")) element.params = arr2ele(proto.slice(2).split(/,/));
	
			if (proto.startsWith("; Item")) {
				let item = proto.slice(8).replace(' ',',');
				[key,val] = item.split(/,/);
				if (!element.params.itemlist) element.params.itemlist = new Array();
				element.params.itemlist.push({'value':key, 'label':val});
			}
	
			if (proto.startsWith(": values")) [key,element.curvalues] = proto.split(/=/); 
	
			if (proto.startsWith("|")) {
				element.comments = arr2ele(proto.slice(2).split(/,/));
				if (element.comments.dBscale_min) {
					let start = parseFloat(element.comments.dBscale_min.replace(/dB/,''));
					let step = parseFloat(element.comments.step.replace(/dB/,''));
/*					element.dbSteps = [];
					
					for (let j = element.params.min; j <= element.params.max; j++) {
						element.dbSteps[j] = start + (step * parseFloat(j));
					} */
				}
			}
		}
		amixer.push(element);
		this.controlset = amixer;
	}
	limited () {
		let controlleft = [1,2,5,7,12,28,39,40,43]; // 4,9,10,13,14,15,17,18,19,20,21,22,23,24,25,26,27,37
		let controlright = [1,3,5,7,12,31,32,33,36]; // 4,9,11,13,14,16,17,18,19,20,21,22,23,24,25,29,30,42,44,45
		let controlcommon = [8]; // 6,25
		let controls = controlleft.concat(controlright.concat(controlcommon)).unique().sort(function(a, b){return a - b});
		let limitedset = new Array();
		for (let ctl = 0; ctl < this.controlset.length; ctl++) {
			if (controls.includes(this.controlset[ctl].id)) limitedset.push(this.controlset[ctl]);
		}
		return limitedset;
	}
}
/*
let x = new mixerState();
console.log(x.controlset.length);
let y = x.limited();
console.log(y.length);
*/
module.exports = MixerState;
