class DINControl {
	constructor() {
		this.pcmvol = 0;
		this.lodigvol = 0;
		this.adcvol = 0;
		this.negres = 0;
		this.powertune = 0;
		this.in1res = 0;
		this.in2res = 0;
		this.dacswitch = 0;
		this.DacPlaybackSwitch = 0;

	}

	setAnalogVol(val) {
		this.pcmvol = val;
	}

	setDigitalVol(val) {
		this.lodigval = val;
	}
	
	setInputVol(val) {
		this.adcvol = val;
	}

	setNegativeResistor(val) {
		this.negres = val;
	}

	setPowerTune(val) {
		this.powertune = val;
	}

	setAFinResistor(val) {
		this.in2res = val;
	}

	setDiscInResistor(val) {
		this.in1res = val;
	}

	setOutputSwitch(val) {
		this.dacswitch = val;
	}

	getAnalogVol() {
		return this.pcmvol;
	}

	getDigitalVol() {
		return this.lodigval;
	}
	
	getInputVol() {
		return this.adcvol;
	}

	getNegativeResistor() {
		return this.negres;
	}

	getPowerTune() {
		return this.powertune;
	}

	getAFinResistor() {
		return this.in2res;
	}

	getDiscInResistor() {
		return this.in1res;
	}

	getOutputSwitch() {
		return this.dacswitch;
	}

	setDACSwitch(val) {
		this.DacPlaybackSwitch = val;
	}

	getDACSwitch() {
		return ehis.DacPlaybackSwitch;
	}
}

class CommonControl {
	constructor() {
		this.PlaybackCMSwitch = 0;
	}

	setCMSwitch(val) {
		this.PlaybackCMSwitch = 0;
	}

	getCMSwitch() {
		returnthis.PlaybackCMSwitch;
	}
}


class Amixer {
	constructor() {
		this.left = new DINControl();
		this.right = new DINControl();
		this.common = new CommonControl();
	}

	setState(controls) {
		for (i=0 ; i < controls.length ; i++) {
			var control = controls[i];
			switch(parseInt(control.specs.numid)) {
				case 1: 
					this.left.setAnalogVol(control.curleft);
					this.right.setAnalogVol(control.curright);
					break;
				case 2:
					this.left.setPowerTune(control.curvalues);
					break;
				case 3:
					this.right.setPowerTune(control.curvalues);
					break;
				case 5:
					this.left.setDigitalVol(control.curleft);
					this.right.setDigitalVol(control.curright);
					break;
				case 7:
					this.left.setDACSwitch(control.curleft);
					this.right.setDACSwitch(control.curright);
					break;
				case 8:
					this.common.setCMSwitch(control.curvalues);
					break;
				case 12:
					this.left.setInputVol(control.curleft);
					this.right.setInputVol(control.curright);
					break;
				case 28:
					this.left.setOutputSwitch(control.curvalues);
					break;
				case 31:
					this.right.setOutputSwitch(control.curvalues);
					break;
				case 32:
					this.right.setDiscInResistor(control.curvalues);
					break;
				case 33:
					this.right.setAFinResistor(control.curvalues);
					break;
				case 36:
					this.right.setNegativeResistor(control.curvalues);
					break;
				case 39:
					this.left.setDiscInResistor(control.curvalues);
					break;
				case 40:
					this.left.setAFinResistor(control.curvalues);
					break;
				case 43:
					this.left.setNegativeResistor(control.curvalues);
					break;
				default: 
					console.log("Error see (amixer.js): " + control.specs.numid + " " + control.specs.name + " not found");
					break;
				
			}
		}
	}
}

module.exports = Amixer;
