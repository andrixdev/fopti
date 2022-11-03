/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

// Global variables in F namespace
const F = {
	audioContext: undefined,
	timuDataArray: []
}
const log = console.log
const dom = {
	main: document.getElementsByTagName('main')[0],
	templates: {
		oscilloscope: document.getElementById('oscilloscope-template'),
		fft: document.getElementById('fft-template')
	}
}
let initOscilloscopeView = () => {
	
	document.getElementsByClassName('mike-start')[0].addEventListener('click', askForMike)

	document.getElementsByClassName('oscillator-start')[0].addEventListener('click', launchBiip)
	
	// Canvas setup
	let ctx = document.getElementById('oscilloscope-canvas').getContext('2d')
	let container = document.getElementById('oscilloscope-container'),
		width = container.clientWidth,
		height = 300
		
	ctx.canvas.width = width
	ctx.canvas.height = height
	
	// Canvas background
	ctx.lineWidth = 1
	ctx.fillStyle = 'hsla(200, 30%, 5%, 1)'
	ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.95)'
	ctx.fillRect(0, 0, width, height)
	
	// Canvas time loop
	let frame = 0
	let loop = () => {
		frame++
		//log(i)
		ctx.clearRect(0, 0, width, height)
		ctx.beginPath()
		
		ctx.moveTo(0, F.timuDataArray[0])
		
		let step = width / F.timuDataArray.length
		for (let i = 0; i < F.timuDataArray.length; i++) {
			ctx.lineTo(i * step, F.timuDataArray[i])
		}
		
		ctx.stroke()
		
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
	
}
let initFFTView = () => {
	document.getElementById('fft-container').addEventListener('click', () => {
		log('yes fft')
	})
}
launchBiip = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	const osc = new OscillatorNode(F.audioContext, {
		frequency: 440,
		type: 'sine' // "sine", "square", "sawtooth", "triangle"
	})
	
	// Link oscillator to audio context destination (for hearing)
	osc.connect(F.audioContext.destination)
	
	// Create audio analyzer
	const analyser = new AnalyserNode(F.audioContext) // Created with FFT size of 2048 (2^11)
	
	// Don't forget to connect it with analyser!
	osc.connect(analyser)
	
	const bufferLength = analyser.frequencyBinCount // 1024
	F.timuDataArray = new Uint8Array(bufferLength) // Full of zeros (1024 == 2^10)
	
	const frequDataArray = new Uint8Array(bufferLength)
	// Start oscillator for one second!
	osc.start()
	osc.stop(1)
	
	let interv = setInterval(() => {
		analyser.getByteTimeDomainData(F.timuDataArray)
		// dataArray now holds the buffer data
		// buffer holds a given limited time interval of amplitude values
		analyser.getByteFrequencyData(frequDataArray)
	}, 30)
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
		
		initOscilloscopeView()
	})
	
	document.getElementById('fft').addEventListener('click', () => {
		dom.main.innerHTML = dom.templates.fft.innerHTML
		
		initFFTView()
	})
	
})
