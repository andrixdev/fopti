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
const log = console.log
const dom = {
	main: document.getElementsByTagName('main')[0],
	templates: {
		oscilloscope: document.getElementById('oscilloscope-template'),
		fft: document.getElementById('fft-template')
	}
}

launchBiip = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	const osc = new OscillatorNode(F.audioContext, {
		frequency: 2000,
		type: 'sine' // "sine", "square", "sawtooth", "triangle"
	})
	
	// Link oscillator to audio context destination (for hearing)
	osc.connect(F.audioContext.destination)
	
	// Create audio analyzer
	const analyser = new AnalyserNode(F.audioContext) // Created with FFT size of 2048 (2^11)
	
	// Don't forget to connect it with analyser!
	osc.connect(analyser)
	
	const bufferLength = analyser.frequencyBinCount // 1024
	const timuDataArray = new Uint8Array(bufferLength) // Full of zeros (1024 == 2^10)
	
	const frequDataArray = new Uint8Array(bufferLength)
	// Start oscillator for one second!
	osc.start()
	osc.stop(1)
	
	let interv = setInterval(() => {
		analyser.getByteTimeDomainData(timuDataArray)
		// dataArray now holds the buffer data
		// buffer holds a given limited time interval of amplitude values
		analyser.getByteFrequencyData(frequDataArray)
		
		log(timuDataArray)
	}, 300)
	setTimeout(() => { clearInterval(interv) }, 1000)
	
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
	
	// Nav mechanics (for now clearing HTML and thus resetting all listeners)
	document.getElementById('oscilloscope').addEventListener('click', () => {
		dom.main.innerHTML = dom.templates.oscilloscope.innerHTML
		
		document.getElementById('oscilloscope-container').addEventListener('click', () => {
			log('yes osci')
		})
		
		document.querySelector("button.mike-start").addEventListener('click', askForMike)
	
		document.querySelector("button.oscillator-start").addEventListener('click', launchBiip)
		
	})
	
	document.getElementById('fft').addEventListener('click', () => {
		dom.main.innerHTML = dom.templates.fft.innerHTML
		
		document.getElementById('fft-container').addEventListener('click', () => {
			log('yes fft')
		})
	})
	
})
