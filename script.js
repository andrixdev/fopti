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
	isOscillatorOn: false,
	ctx3TimerStart: undefined,
	ctx4TimerStart: undefined
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
		timefreq: document.getElementById('timefreq-template'),
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
	
	ctx1.lineWidth = 1
	ctx1.strokeStyle = 'white'
	
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
	
	ctx2.lineWidth = 1
	ctx2.strokeStyle = 'white'
	
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
let initTimefreqView = () => {
	// Canvas setup
	let ctx3 = document.getElementById('timefreq-canvas').getContext('2d')
	let container3 = document.getElementById('timefreq-container'),
		width = container3.clientWidth,
		height = 300
		
	ctx3.canvas.width = width
	ctx3.canvas.height = height
	ctx3.globalCompositeOperation = 'lighter'
	//ctx3.filter = 'contrast(500%)'//'blur(2px) contrast(500%)'; /!\ Adds significant lag
	
	// Canvas background
	ctx3.fillStyle = 'black'
	ctx3.fillRect(0, 0, width, height)
	
	// Canvas time loop
	F.ctx3TimerStart = new Date().getTime()
	let frame = 0,
		lastX = 0,
		X = 0,
		time = F.ctx3TimerStart,
		radarMS = 5000, // ms
		sections = 50,
		zoneHeight = height / sections
		
	// Just analyse a proportion of all frequencies (lowest picthes)
	let rangeProportion = 0.3
		
	let loop3 = () => {
		frame++
		let newTime = new Date().getTime()
		
		// Radar over X axis
		X = width * ((newTime - F.ctx3TimerStart) % radarMS) / radarMS
		
		// Paint wider rectangles if refresh time is longer
		let thickness = width * (newTime - time) / radarMS
		
		/*
		ctx3.beginPath()
		ctx3.fillStyle = 'black'
		ctx3.clearRect(X - thickness, 0, thickness, height)
		ctx3.closePath()
		*/
		
		for (let s = 0; s < sections; s++) {
			let sectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * s)
			
			let sampleValue = F.frequDataArray[sectionSampleIndex] // Not averaged or anything, just probed
			
			// Position of colored zone
			let y = height - height * s / sections
			
			// Colors
			let hue = 260 - sampleValue / 255 * 60
			let lum = 0.3 + 0.6 * sampleValue / 255 * 100
			let alpha = sampleValue / 255 * 0.7
			
			// Clear previous (not painting black because of composite 'lighter' mode)
			ctx3.clearRect(X - thickness, y, thickness, zoneHeight)
			
			// Fill!
			ctx3.fillStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
			ctx3.fillRect(X - thickness, y, thickness, zoneHeight)
			
			// Draw a shadow circle around
			ctx3.beginPath()
			let radius = 0.7 * (zoneHeight + thickness)//Math.min(zoneHeight, thickness)//
			radius = Math.min(Math.min(radius, 2 * zoneHeight), 2 * thickness)
			
			ctx3.arc(X - thickness / 2, y + zoneHeight / 2, radius, 0, 2 * Math.PI, false)
			ctx3.fillStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha / 3 + ')'
			ctx3.fill()
			ctx3.closePath()
		}
		
		lastX = X
		time = newTime
		
		window.requestAnimationFrame(loop3)
	}
	window.requestAnimationFrame(loop3)
}
let initCombinedView = () => {
	
	// Canvas setup
	let ctx4 = document.getElementById('combined-canvas').getContext('2d')
	let container4 = document.getElementById('combined-container'),
		width = container4.clientWidth,
		height = 500
		
	ctx4.canvas.width = width
	ctx4.canvas.height = height
	ctx4.imageSmoothingEnabled = true
	
	// Canvas background
	ctx4.fillStyle = 'black'
	ctx4.fillRect(0, 0, width, height)
	
	// Canvas time loop
	F.ctx4TimerStart = new Date().getTime()
	let frame = 0,
		lastTheta = 0,
		theta = 0,
		time = F.ctx4TimerStart,
		radarMS = 5000, // ms
		sections = 50,
		baseRadius = 100,
		maxRadius = 400,
		zoneHeight = (maxRadius - baseRadius) / sections,
		centerX = width / 2,
		centerY = height / 2
	
	// Just analyse a proportion of all frequencies (lowest picthes)
	let rangeProportion = 0.3
		
	let loop4 = () => {
		frame++
		let newTime = new Date().getTime()
		
		// Radar over Theta
		theta = 2 * Math.PI * ((newTime - F.ctx4TimerStart) % radarMS) / radarMS
		
		
		// Paint wider arcs (in theta) if refresh time is longer
		let thetaRange = 2 * Math.PI * (newTime - time) / radarMS
		
		for (let s = 0; s < sections; s++) {
			let sectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * s)
			
			let sampleValue = F.frequDataArray[sectionSampleIndex] // Not averaged or anything, just probed
			
			let r = baseRadius + (maxRadius - baseRadius) * s / sections
			
			// Colors
			let hue = 260 - sampleValue / 255 * 60
			let lum = 0.3 + 0.6 * sampleValue / 255 * 100
			let alpha = sampleValue / 255 * 0.7
			
			// Draw new arc
			ctx4.beginPath()
			ctx4.arc(centerX, centerY, r + zoneHeight / 2, lastTheta, theta, false)
			ctx4.strokeStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
			ctx4.lineWidth = zoneHeight
			ctx4.stroke()
			ctx4.closePath()
		}
		
		lastTheta = theta
		time = newTime
		
		window.requestAnimationFrame(loop4)
	}
	window.requestAnimationFrame(loop4)
	
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
	let t = 0
	setInterval(() => {
		t++
		F.osci.frequency.value = 2100 + 2000 * Math.sin(t / 3)
	}, 300)
	
}
let startOscillator = () => {
	
	// Link oscillator to audio context destination (for hearing)
	//F.osci.connect(F.audioContext.destination)
	
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
	
	document.getElementById('timefreq').addEventListener('click', (ev) => {
		dom.main.innerHTML = dom.templates.timefreq.innerHTML
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initTimefreqView()
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
