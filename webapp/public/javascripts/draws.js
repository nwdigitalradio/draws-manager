const socket = io.connect();
// console.log(socket);
let Radios = new Array();

function calcTX(ptpmv) {
	let ref = 500; // 3204 0db reference
        let pv = ptpmv / 2.0; // PTP MV divide by 2
        let rms = pv / Math.sqrt(2.0);

        let rawdb = 20 * Math.log10(rms/ref);

        let db1 = parseFloat(Math.round(rawdb));
        let diff =  0;
        if ((rawdb - db1) > 0.25) diff = 0.5;
        if (-0.25 > (rawdb - db1)) diff = -0.5;
        let db2 = db1 + diff;
        let aout = db1 > -6.0 ? db1 : -6.0; // LO
        let digout = db1 < -6.0 ? db2 + 6.0 : 0.0; //PCM
	document.getElementById('calc-aout').innerHTML = "Analog Gain (LO) = " + aout + " db";
	document.getElementById('calc-digout').innerHTML = "Digital Gain (PCM) = " + digout + " db";
	document.getElementById('calc-totdb').innerHTML = "Total Gain = " + db1 + " db (" + rawdb.toFixed(2) + ")";
}


function updateControl(control, slidervalue) {
	const change = new Event('change');
	let xcontrol = document.getElementById(control);
//	console.log(slidervalue);
	xcontrol.value = slidervalue;
	xcontrol.dispatchEvent(change);
}

function ptmvalue(x){
//	console.log("PTM Value " + x);
	switch(x) {
		case '0' : return 'PTM_P3';
			break;
		case '1' : return 'PTM_P2';
			break;
		case '2' : return 'PTM_P1';
			break;
		default :
			console.log('bad Powertune Value = ' + x);
			return 'PTM_P3';
			break;
	}
}

function sset(control) {
	let val = "";
	switch(parseInt(control)) {
		case 1: 
			val += document.getElementById("left-pcmvol").value;
			val += "," + document.getElementById("right-pcmvol").value;
			break;
		case 2:
			val = ptmvalue(document.getElementById("left-ptm").value);
			break;
		case 3:
			val = ptmvalue(document.getElementById("right-ptm").value);
			break;
		case 5:
			val += document.getElementById("left-lodigvol").value;
			val += "," + document.getElementById("right-lodigvol").value;
			break;
		case 8:
			let psv = document.getElementById("playbackcmsw").value;
			switch(parseInt(psv)) {
				case 0:
					val = "Full Chip CM";
					break;
				case 1:
					val = "1.65V";
					break;
				default:
					console.log("Bad Value for playbackcmsw");
					break;
			}
			break;
		case 12:
			val += document.getElementById("left-adcvol").value;
			val += "," + document.getElementById("right-adcvol").value;
			break;
		default: 
			val = "Unknown";
			break;
	}
	
	let message ={control:control,value:val};
	socket.emit('sset',message,function(data){if(data.connected) console.log('Connected')});
//	console.log(message);
}

function execute(arg) {
	socket.emit('execute',{value:arg});
}

function DACset() {
	let message = {};
	let lv = document.getElementById('left-audiorx').value;
	let rv = document.getElementById('right-audiorx').value;
	// console.log(lv + " " + rv);
	let leftdacswitch = "on";
	let leftdacplaysw = "on";
	let rightdacswitch = "on";
	let rightdacplaysw = "on";
	switch (lv) {
		case "off" :
			message = {control:40,value:'Off'};
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:39,value:'Off'};
			socket.emit('sset',message,function(data){console.log(data)});
			leftdacswitch = "off";
			leftdacplaysw = "off";
			break;
		case 'af' :
			message = {control:40,value:'10 kOhm'}; // 10KOhm
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:39,value:'Off'}; // off
			socket.emit('sset',message,function(data){console.log(data)});
			break;
		case 'disc' :
			message = {control:40,value:'Off'};
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:39,value:'10 kOhm'};
			socket.emit('sset',message,function(data){console.log(data)});
			break;
		default : 
			console.log('Left DAC Bad ' + lv);
			break;
	}	
	switch (rv) {
		case "off" :
			message = {control:33,value:'Off'}; 
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:32,value:'Off'};
			socket.emit('sset',message,function(data){console.log(data)});
			rightdacswitch = "off";
			rightdacplaysw = "off";
			break;
		case 'af' :
			message = {control:33,value:'10 kOhm'}; // 10KOhm
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:32,value:'Off'}; // off
			socket.emit('sset',message,function(data){console.log(data)});
			break;
		case 'disc' :
			message = {control:33,value:'Off'};
			socket.emit('sset',message,function(data){console.log(data)});
			message = {control:32,value:'10 kOhm'};
			socket.emit('sset',message,function(data){console.log(data)});
			break;
		default : 
			console.log('Right DAC Bad ' + lv);
			break;
	}	

	// set left and right neg resistors
	message = {control:36,value:'10 kOhm'}; // 10KOhm
	socket.emit('sset',message,function(data){console.log(data)});
	message = {control:43,value:'10 kOhm'}; // 10KOhm
	socket.emit('sset',message,function(data){console.log(data)});

	let msgdacswitch = leftdacswitch + "," + rightdacswitch;
	message = {control:7,value:msgdacswitch};
	socket.emit('sset',message,function(data){console.log(data)});
	// console.log(message);

	message = {control:28,value:leftdacplaysw};
	socket.emit('sset',message,function(data){console.log(data)});
	// console.log(message);

	message = {control:31,value:rightdacplaysw};
	socket.emit('sset',message,function(data){console.log(data)});
	// console.log(message);

}

function setElement(id,str) {
	var ele = document.getElementById(id);
	if (ele) ele.innerHTML = str
	else console.log("Failed to find ID=" + id);
}

function toggleByClass(cn) {
	let x = document.getElementsByClassName(cn);
	for (let i=0;i < x.length;i++) {
		if (x[i].style.display == "none" || x[i].style.display == "") {
			x[i].style.display = "block";
		} else {
			x[i].style.display = "none";
		}
	}
}

function ptm2idx(str) {
	switch(str) {
		case "PTM_P3":
			return 0;
			break;
		case "PTM_P2":
			return 1;
			break;
		case "PTM_P1":
			return 2;
			break;
	}
	return 0;
}

function digvoldb(db) {
	return parseInt(parseFloat(db) + 6);
}

function adcvoldb(db) {
	return parseInt((parseFloat(db) + 12) * 2);
}

function pcmvoldb(db) {
	return parseInt((parseFloat(db) + 63.5) * 2);
}

function radioset(side,index) {
	const change = new Event('change');
	// console.log(side + " " + index + " " + Radios[index].radio);
	if (index == -1) {
		console.log("No Change");
		return;
	}
	if (index == -2) {
		document.getElementById(side + '-audiorx').value = "off";
		document.getElementById(side + '-audiorx').dispatchEvent(change);
		return;
	}
	document.getElementById(side + '-audiorx').value = Radios[index].audiorx;
	document.getElementById(side + '-audiorx').dispatchEvent(change);
	document.getElementById(side + '-lodigvol').value = digvoldb(Radios[index].lodigvol);
	document.getElementById(side + '-lodigvol').dispatchEvent(change);
	document.getElementById(side + '-adcvol').value = adcvoldb(Radios[index].adcvol);
	document.getElementById(side + '-adcvol').dispatchEvent(change);
	document.getElementById(side + '-pcmvol').value = pcmvoldb(Radios[index].pcmvol);
	document.getElementById(side + '-pcmvol').dispatchEvent(change);
	document.getElementById(side + '-ptm').value = ptm2idx(Radios[index].powertune);
	document.getElementById(side + '-ptm').dispatchEvent(change);
}

(function () {
	socket.on('radios',function(radios) {
		Radios = radios;
		let leftradios = document.getElementById('left-radios');
		let rightradios = document.getElementById('right-radios');
		while (leftradios.firstChild) leftradios.removeChild(leftradios.firstChild);
		while (rightradios.firstChild) rightradios.removeChild(rightradios.firstChild);

		// Turn Radio Off
		var loffradio = document.createElement("option");
		var loffradtxt = document.createTextNode("Off");
 		loffradio.appendChild(loffradtxt);
		loffradio.value = -2;

		leftradios.appendChild(loffradio);

		var roffradio = document.createElement("option");
		var roffradtxt = document.createTextNode("Off");
 		roffradio.appendChild(roffradtxt);
		roffradio.value = -2;

		rightradios.appendChild(roffradio);

		// No Change
		var lnoradio = document.createElement("option");
		var lnoradtxt = document.createTextNode("None");
 		lnoradio.appendChild(lnoradtxt);
		lnoradio.selected = "selected";
		lnoradio.value = -1;

		leftradios.appendChild(lnoradio);

		var rnoradio = document.createElement("option");
		var rnoradtxt = document.createTextNode("None");
 		rnoradio.appendChild(rnoradtxt);
		rnoradio.selected = "selected";
		rnoradio.value = -1;

		rightradios.appendChild(rnoradio);

		// add radios
		for (let n=0;n < Radios.length;n++ ) {
			var leftNode = document.createElement("option");
			leftNode.value = n;
			var leftName = document.createTextNode(Radios[n].radio);
			leftNode.appendChild(leftName);
			leftradios.appendChild(leftNode);

			var rightNode = document.createElement("option");
			rightNode.value = n;
			var rightName = document.createTextNode(Radios[n].radio);
			rightNode.appendChild(rightName);
			rightradios.appendChild(rightNode);
		}
	//	console.log(JSON.stringify(Radios));
	});

	socket.on('systemstats', function(data) {
		socket.send('sset','test');
		if (data.sensors) {
			let sensors = data.sensors;
			let sensdata = "";
			for (let s=0; s < sensors.length; s++) {
				sensdata += sensors[s].label + ": " + sensors[s].value;
				if (s < (sensors.length - 1)) sensdata += " &bull; ";
			}
			setElement("sensors",sensdata);
		}
		if (data.model) setElement("model",data.model);
		if (data.hat.product) {
			let prodtitle = "Vendor: " + data.hat.vendor + ", Product ID: " + data.hat.product_id + ", Version: " + data.hat.product_ver;
			let productID = document.getElementById("product");
			productID.setAttribute("title",prodtitle);
			setElement("product",data.hat.product);
		}
		if (data.cputemp) {
			var cput = "";
			cput += data.cputemp.f + "&deg; F (" + data.cputemp.c + "&deg; C)";
			setElement("cputemp",cput);
		}
		if (data.uptime) {
			var upstr = "";
			if (data.uptime.days > 0) upstr += " " + data.uptime.days + " days";
			var hms = data.uptime.hms.split(":");
			if (parseInt(hms[0]) > 0) upstr += " " + hms[0] + " hrs";
			upstr += " " + hms[1] + " mins";
			setElement("uptime",upstr);
		}
		if (data.loadavg) {
			var la = " 1m:" + data.loadavg.one + " 5m:" + data.loadavg.five + " 15m:" + data.loadavg.fifteen;
			setElement("loadavg", la);
		}
		if (data.mixer) {
			let leftdin = data.mixer.left;	
			let rightdin = data.mixer.right;	
			let commonset = data.mixer.common;
			
			document.getElementById("left-pcmvol").value = leftdin.pcmvol;
			document.getElementById("right-pcmvol").value = rightdin.pcmvol;
			document.getElementById("slider-left-pcmvol").value = leftdin.pcmvol;
			document.getElementById("slider-right-pcmvol").value = rightdin.pcmvol;
			document.getElementById("left-adcvol").value = leftdin.adcvol;
			document.getElementById("right-adcvol").value = rightdin.adcvol;
			document.getElementById("slider-left-adcvol").value = leftdin.adcvol;
			document.getElementById("slider-right-adcvol").value = rightdin.adcvol;
			document.getElementById("left-lodigvol").value = leftdin.lodigvol;
			document.getElementById("right-lodigvol").value = rightdin.lodigvol;
			document.getElementById("slider-left-lodigvol").value = leftdin.lodigvol;
			document.getElementById("slider-right-lodigvol").value = rightdin.lodigvol;
			document.getElementById("left-ptm").value = leftdin.powertune;
			document.getElementById("right-ptm").value = rightdin.powertune;
			document.getElementById("playbackcmsw").value = commonset.playbackcmsw;
			if (leftdin.dacswitch == "off" || leftdin.dacplaysw == "off") document.getElementById("left-audiorx").value = "off";
			else {
				if (leftdin.in1res == "1") document.getElementById("left-audiorx").value = "disc";
				if (leftdin.in2res == "1") document.getElementById("left-audiorx").value = "af";
			}

			if (rightdin.dacswitch == "off" || rightdin.dacplaysw == "off") document.getElementById("right-audiorx").value = "off";
			else {
				if (rightdin.in1res == "1") document.getElementById("right-audiorx").value = "disc";
				if (rightdin.in2res == "1") document.getElementById("right-audiorx").value = "af";
			}


		}
//		console.log(data.mixer);
	});
})();
