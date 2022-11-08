/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

// Global variables in F namespace
const F = {
	audioContext: undefined,
	timuDataArray: [],
	frequDataArray: [],
	isMikeOn: false,
	isOscillatorOn: false
}
const log = console.log
const dom = {
	main: document.getElementsByTagName('main')[0],
	templates: {
		home: document.getElementById('home-template'),
		oscilloscope: document.getElementById('oscilloscope-template'),
		fft: document.getElementById('fft-template')
	}
}
let initOscilloscopeView = () => {
	
	// Canvas setup
	let ctx1 = document.getElementById('oscilloscope-canvas').getContext('2d')
	let container1 = document.getElementById('oscilloscope-container'),
		width = container1.clientWidth,
		height = 300
		
	ctx1.canvas.width = width
	ctx1.canvas.height = height
	
	// Canvas background
	ctx1.lineWidth = 1
	ctx1.fillStyle = 'hsla(200, 30%, 5%, 1)'
	ctx1.strokeStyle = 'hsla(0, 0%, 100%, 0.95)'
	ctx1.fillRect(0, 0, width, height)
	
	// Canvas time loop
	let frame = 0
	let loop1 = () => {
		frame++
		//log(i)
		ctx1.clearRect(0, 0, width, height)
		ctx1.beginPath()
		
		ctx1.moveTo(0, F.timuDataArray[0])
		
		let step = width / F.timuDataArray.length
		for (let i = 0; i < F.timuDataArray.length; i++) {
			ctx1.lineTo(i * step, F.timuDataArray[i])
		}
		
		ctx1.stroke()
		
		window.requestAnimationFrame(loop1)
	}
	window.requestAnimationFrame(loop1)
	
}
let initFFTView = () => {
	// Canvas setup
	let ctx2 = document.getElementById('fft-canvas').getContext('2d')
	let container2 = document.getElementById('fft-container'),
		width = container2.clientWidth,
		height = 300
		
	ctx2.canvas.width = width
	ctx2.canvas.height = height
	
	// Canvas background
	ctx2.lineWidth = 1
	ctx2.fillStyle = 'hsla(200, 30%, 5%, 1)'
	ctx2.strokeStyle = 'hsla(0, 0%, 100%, 0.95)'
	ctx2.fillRect(0, 0, width, height)
	
	// Canvas time loop
	let frame = 0
	let loop2 = () => {
		frame++
		//log(i)
		ctx2.clearRect(0, 0, width, height)
		ctx2.beginPath()
		
		ctx2.moveTo(0, F.frequDataArray[0])
		
		let step = width / F.frequDataArray.length
		for (let i = 0; i < F.frequDataArray.length; i++) {
			ctx2.lineTo(i * step, F.frequDataArray[i])
		}
		
		ctx2.stroke()
		
		window.requestAnimationFrame(loop2)
	}
	window.requestAnimationFrame(loop2)
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
	
	F.frequDataArray = new Uint8Array(bufferLength)
	
	// Start oscillator for one second!
	osc.start()
	F.isOscillatorOn = true
	
	let duration = 1
	osc.stop(duration)
	setTimeout(() => { F.isOscillatorOn = false }, duration * 1000)
	
	let interv = setInterval(() => {
		analyser.getByteTimeDomainData(F.timuDataArray)
		// dataArray now holds the buffer data
		// buffer holds a given limited time interval of amplitude values
		analyser.getByteFrequencyData(F.frequDataArray)
		
		log(F.frequDataArray)
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
			F.isMikeOn = true
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
	
	// Audio buttons 
	document.getElementsByClassName('mike-start')[0].addEventListener('click', askForMike)
	document.getElementsByClassName('oscillator-start')[0].addEventListener('click', launchBiip)
	
	// Nav mechanics (for now clearing HTML and thus resetting all listeners)
	let resetActivatedTab = () => {
		Array.from(document.getElementsByClassName('tab')).forEach((el) => {
			el.classList = 'tab'
		})
	}
	let setActiveTab = (node) => {
		node.classList = 'tab active'
	}
	
	
	document.getElementById('home').addEventListener('click', (ev) => {
		dom.main.innerHTML = dom.templates.home.innerHTML
		resetActivatedTab()
		setActiveTab(ev.target)
	})
	
	document.getElementById('oscilloscope').addEventListener('click', (ev) => {
		dom.main.innerHTML = dom.templates.oscilloscope.innerHTML
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initOscilloscopeView()
	})
	
	
	document.getElementById('fft').addEventListener('click', (ev) => {
		dom.main.innerHTML = dom.templates.fft.innerHTML
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initFFTView()
	})
	
	// Init on #home view
	dom.main.innerHTML = dom.templates.home.innerHTML
	setActiveTab(document.getElementById('home'))
	
})
