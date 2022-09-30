/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

// Global variables in F namespace
const F = {
	audioContext: undefined
}

launchBiip = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	const osc = new OscillatorNode(F.audioContext, {
		frequency: 440,
		type: 'sawtooth' // "sine", "square", "sawtooth", "triangle"
	})
	
	// Link oscillator to audio context destination
	osc.connect(F.audioContext.destination)
}
askForMike = () => {
	if (navigator.mediaDevices) {
		console.log("getUserMedia supported.")
		navigator.mediaDevices.getUserMedia({
			audio: true
		})
		.then((stream) => {
			F.audioContext = new AudioContext({ sampleRate: 48000 })
			const source = F.audioContext.createMediaStreamSource(stream);
		})
		.catch((err) => {
			console.log(`The following getUserMedia error occurred: ${err}`);
		})
	} else {
		console.log("getUserMedia is not supported on this browser!");
	}
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	document.querySelector("button.mike-start").addEventListener('click', askForMike)
	
	document.querySelector("button.oscillator-start").addEventListener('click', launchBiip)
	
})
