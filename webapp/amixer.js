class DINControl {
	constructor() {
		this.pcmvol = 0;	//1 PCM Playback Volume
		this.lodigvol = 0;	//5 LO Driver Gain Volume
		this.adcvol = 0;	//12 ADC Level Volume
		this.negres = 1;	//36 CM_R to Right Mixer Neg / 43 CM_L to Left Mixer Neg
		this.powertune = 0;	//2 DAC Left Playback Powertune / 3 DAC Right Powertune
		this.in1res = 0;	//32 IN1_R / 39 IN_L
		this.in2res = 1;	//33 IN1_R / 40 IN_L
		this.dacswitch = 0;	//7 LO DAC Playback Switch
		this.dacplaysw = "on";	//28,31 LOx Outpet Mixer x_DAC Switch

	}

	setAnalogVol(val) {
		this.pcmvol = val;
	}

	setDigitalVol(val) {
		this.lodigvol = val;
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

	setDACSwitch(val) {
		this.dacplaysw = val;
	}

	setOutputSwitch(val) {
		this.dacswitch = val;
	}

	getAnalogVol() {
		return this.pcmvol;
	}

	getDigitalVol() {
		return this.lodigvol;
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


	getDACSwitch() {
		return this.dacplaysw;
	}
}

class CommonControl {
	constructor() {
		this.playbackcmsw = 0;	//8 LO Playback Common Mode Switch
	}

	setCMSwitch(val) {
		this.playbackcmsw = val;
	}

	getCMSwitch() {
		return this.playbackcmsw;
	}
}


class Amixer {
	constructor() {
		this.left = new DINControl();
		this.right = new DINControl();
		this.common = new CommonControl();
	}

	setState(controls) {
		for (let i=0 ; i < controls.length ; i++) {
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
