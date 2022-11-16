/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

// Global variables in F namespace
const F = {
	audioContext: undefined,
	osci: undefined,
	mike: undefined,
	analyser: undefined,
	timuDataArray: [],
	frequDataArray: [],
	isMikeOn: false,
	isOscillatorOn: false
}
const log = console.log
const dom = {
	main: document.getElementsByTagName('main')[0],
	audioStartButton: document.getElementsByClassName('audio-start')[0],
	mikeStartButton: document.getElementsByClassName('mike-start')[0],
	mikeStopButton: document.getElementsByClassName('mike-stop')[0],
	oscillatorStartButton: document.getElementsByClassName('oscillator-start')[0],
	oscillatorStopButton: document.getElementsByClassName('oscillator-stop')[0],
	templates: {
		home: document.getElementById('home-template'),
		oscilloscope: document.getElementById('oscilloscope-template'),
		fft: document.getElementById('fft-template'),
		combined: document.getElementById('combined-template')
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
		
		ctx1.clearRect(0, 0, width, height)
		ctx1.beginPath()
		
		ctx1.moveTo(0, 255 - F.timuDataArray[0])
		
		let step = width / F.timuDataArray.length
		for (let i = 0; i < F.timuDataArray.length; i++) {
			ctx1.lineTo(i * step, 255 - F.timuDataArray[i])
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
		
		ctx2.clearRect(0, 0, width, height)
		ctx2.beginPath()
		
		ctx2.moveTo(0, 255 - F.frequDataArray[0])
		
		let step = width / F.frequDataArray.length
		for (let i = 0; i < F.frequDataArray.length; i++) {
			ctx2.lineTo(i * step, 255 - F.frequDataArray[i])
		}
		
		ctx2.stroke()
		
		window.requestAnimationFrame(loop2)
	}
	window.requestAnimationFrame(loop2)
}
let initCombinedView = () => {
	// Canvas setup
	let ctx3 = document.getElementById('combined-canvas').getContext('2d')
	let container3 = document.getElementById('combined-container'),
		width = container3.clientWidth,
		height = 300
		
	ctx3.canvas.width = width
	ctx3.canvas.height = height
	
	// Canvas background
	ctx3.lineWidth = 1
	ctx3.fillStyle = 'hsla(200, 30%, 5%, 1)'
	ctx3.strokeStyle = 'hsla(0, 0%, 100%, 0.95)'
	ctx3.fillRect(0, 0, width, height)
	
	// Canvas time loop
	let frame = 0
	let loop3 = () => {
		frame++
		
		ctx3.clearRect(0, 0, width, height)
		ctx3.beginPath()
		
		ctx3.moveTo(0, 255 - F.frequDataArray[0])
		
		let step = width / F.frequDataArray.length
		for (let i = 0; i < F.frequDataArray.length; i++) {
			ctx3.lineTo(i * step, 255 - F.frequDataArray[i])
		}
		
		ctx3.stroke()
		
		window.requestAnimationFrame(loop3)
	}
	window.requestAnimationFrame(loop3)
}


let startAudio = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	F.osci = new OscillatorNode(F.audioContext, {
		frequency: 440,
		type: "sine" // "sine", "square", "sawtooth", "triangle"
	})
	
	// Create audio analyzer
	F.analyser = new AnalyserNode(F.audioContext) // Created with FFT size of 2048 (2^11)
	const bufferLength = F.analyser.frequencyBinCount // 1024
	F.timuDataArray = new Uint8Array(bufferLength) // Full of zeros (1024 == 2^10)
	F.frequDataArray = new Uint8Array(bufferLength)
	
	// Start oscillator (without hearing or analysing it yet)
	if (!F.isOscillatorOn) {
		F.osci.start()
		F.isOscillatorOn = true
	}
	
	// Start analyser passing data to glabal data arrays
	let interv = setInterval(() => {
		F.analyser.getByteTimeDomainData(F.timuDataArray)
		// dataArray now holds the buffer data
		// buffer holds a given limited time interval of amplitude values
		F.analyser.getByteFrequencyData(F.frequDataArray)
	}, 50)
	
	// Some music with osci
	setInterval(() => {
		F.osci.frequency.value = 100 + 100 * Math.ceil(10 * Math.random())
	}, 200)
}
let startOscillator = () => {
	
	// Link oscillator to audio context destination (for hearing)
	F.osci.connect(F.audioContext.destination)
	
	// Don't forget to connect it with analyser!
	F.osci.connect(F.analyser)
	
	let duration = 1
	//F.osci.stop(duration)
	setTimeout(() => {
		//F.isOscillatorOn = false
	}, duration * 1000)
	
}
let startMicrophone = () => {
	if (navigator.mediaDevices) {
		console.log("getUserMedia supported.")
		navigator.mediaDevices.getUserMedia({
			audio: true
		})
		.then((stream) => {
			F.isMikeOn = true
			F.mike = F.audioContext.createMediaStreamSource(stream)
			// Link to destination for hearing
			F.mike.connect(F.audioContext.destination)
			// Connect it with analyser!
			F.mike.connect(F.analyser)
		})
		.catch((err) => {
			console.log(`The following getUserMedia error occurred: ${err}`);
		})
	} else {
		console.log("getUserMedia is not supported on this browser!");
	}
}
let stopOscillator = () => {
	// Don't kill the adio node but just disconnect from analyser and output
	F.osci.disconnect(F.analyser)
	F.osci.disconnect(F.audioContext.destination)
}
let stopMicrophone = () => {
	// Don't kill the adio node but just disconnect from analyser and output
	F.mike.disconnect(F.audioContext.destination)
	F.mike.disconnect(F.analyser)
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	// Audio buttons 
	dom.audioStartButton.addEventListener('click', () => {
		// Display the other buttons
		dom.audioStartButton.classList.add('hidden')
		dom.mikeStartButton.classList.remove('hidden')
		dom.oscillatorStartButton.classList.remove('hidden')
		
		// Do some global audio init
		startAudio()
	})
	dom.mikeStartButton.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.mikeStopButton.classList.remove('hidden')
		dom.mikeStartButton.classList.add('hidden')
		dom.oscillatorStartButton.classList.add('hidden')
		
		startMicrophone()
	})
	dom.oscillatorStartButton.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.oscillatorStopButton.classList.remove('hidden')
		dom.oscillatorStartButton.classList.add('hidden')
		dom.mikeStartButton.classList.add('hidden')
		
		startOscillator()
	})
	dom.mikeStopButton.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.mikeStopButton.classList.add('hidden')
		dom.mikeStartButton.classList.remove('hidden')
		dom.oscillatorStartButton.classList.remove('hidden')
		
		stopMicrophone()
	})
	dom.oscillatorStopButton.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.oscillatorStopButton.classList.add('hidden')
		dom.oscillatorStartButton.classList.remove('hidden')
		dom.mikeStartButton.classList.remove('hidden')
		
		stopOscillator()
	})
	
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
	
	document.getElementById('combined').addEventListener('click', (ev) => {
		dom.main.innerHTML = dom.templates.combined.innerHTML
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initCombinedView()
	})
	
	// Init on #home view
	dom.main.innerHTML = dom.templates.home.innerHTML
	setActiveTab(document.getElementById('home'))
	
})
