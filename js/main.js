/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

// Global variables in F namespace
let F = {
	audioContext: undefined,
	osci: undefined,
	mike: undefined,
	analyser: undefined,
	gain: undefined,
	timuDataArray: [],
	frequDataArray: [],
	isMikeOn: false,
	isOscillatorOn: false,
	timefreqCtxTimerStart: undefined,
	combinedCtxTimerStart: undefined,
	activeView: 'home'
}
const log = console.log
const dom = {
	body: document.getElementsByTagName('body')[0],
	main: document.getElementsByTagName('main')[0],
	navTabs: document.getElementsByClassName('tab'),
	buttons: {
		audioStart: document.getElementsByClassName('audio-start')[0],
		mikeStart: document.getElementsByClassName('mike-start')[0],
		mikeStop: document.getElementsByClassName('mike-stop')[0],
		oscillatorStart: document.getElementsByClassName('oscillator-start')[0],
		oscillatorStop: document.getElementsByClassName('oscillator-stop')[0],
		audioMute: document.getElementsByClassName('audio-mute')[0],
		audioUnmute: document.getElementsByClassName('audio-unmute')[0]
	},
	templates: {
		home: document.getElementById('home-template'),
		oscilloscope: document.getElementById('oscilloscope-template'),
		fft: document.getElementById('fft-template'),
		timefreq: document.getElementById('timefreq-template'),
		combined: document.getElementById('combined-template')
	}
}

let loadView = (newViewName) => {
	let newViewNode
	if (newViewName == 'home') {
		newViewNode = dom.templates.home
	} else if (newViewName == 'oscilloscope') {
		newViewNode = dom.templates.oscilloscope
	} else if (newViewName == 'fft') {
		newViewNode = dom.templates.fft
	} else if (newViewName == 'timefreq') {
		newViewNode = dom.templates.timefreq
	} else if (newViewName == 'combined') {
		newViewNode = dom.templates.combined
	} else {
		log("New view name is unknown in loadView()")
	}
	
	dom.body.append(dom.main.firstElementChild)
	dom.main.appendChild(newViewNode)
	
	F.activeView = newViewName
}
let resetActivatedTab = () => {
	Array.from(document.getElementsByClassName('tab')).forEach((el) => {
		el.classList = 'tab'
	})
}
let setActiveTab = (node) => {
	node.classList = 'tab active'
}
let initNavAndViewMechanics = () => {
	// Nav mechanics (for now clearing HTML and thus resetting all listeners)
	
	document.getElementById('home').addEventListener('click', (ev) => {
		loadView('home')
		resetActivatedTab()
		setActiveTab(ev.target)
	})
	
	document.getElementById('oscilloscope').addEventListener('click', (ev) => {
		loadView('oscilloscope')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initOscilloscopeView()
	})
	
	document.getElementById('fft').addEventListener('click', (ev) => {
		loadView('fft')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initFFTView()
	})
	
	document.getElementById('timefreq').addEventListener('click', (ev) => {
		loadView('timefreq')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initTimefreqView()
	})
	
	document.getElementById('combined').addEventListener('click', (ev) => {
		loadView('combined')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		initCombinedView()
	})
}

let initOscilloscopeView = () => {
	
	// Canvas setup
	let ctx1 = document.getElementById('oscilloscope-curve-canvas').getContext('2d'),
		ctx2 = document.getElementById('oscilloscope-axes-canvas').getContext('2d'),
		ctx3 = document.getElementById('oscilloscope-grid-canvas').getContext('2d')
		
	let container = document.getElementById('oscilloscope-container'),
		width = container.clientWidth,
		height = Math.min(container.clientHeight, 500)
		
	ctx1.canvas.width = width
	ctx1.canvas.height = height
	ctx1.lineWidth = 1
	ctx1.strokeStyle = 'white'
	
	ctx2.canvas.width = width
	ctx2.canvas.height = height
	ctx2.lineWidth = 1
	ctx2.strokeStyle = 'white'
	ctx2.fillStyle = 'white'
	ctx2.font = '15px Raleway'
	ctx2.textAlign = 'center'
	
	ctx3.canvas.width = width
	ctx3.canvas.height = height
	ctx3.lineWidth = 1
	ctx3.strokeStyle = 'rgba(255, 255, 255, 0.4)'
	ctx3.fillStyle = 'white'
	ctx3.font = '15px Raleway'
	ctx3.textAlign = 'center'
	
	let axesAreDrawn = false,
		gridIsDrawn = false
		
	let drawAxes = () => {
		// Horizontal
		ctx2.beginPath()
		ctx2.moveTo(10/100 * width, height / 2)
		ctx2.lineTo(92/100 * width, height / 2)
		ctx2.stroke()
		ctx2.closePath()
		
		// Vertical
		ctx2.beginPath()
		ctx2.moveTo(90/100 * width, 90/100 * height)
		ctx2.lineTo(90/100 * width, 15/100 * height)
		ctx2.stroke()
		ctx2.closePath()
		
		// Vertical arrow
		let arrowWidth = 0.75/100 * width,
			arrowHeight = 5/100 * height
		ctx2.beginPath()
		ctx2.moveTo(90/100 * width, 10/100 * height)
		ctx2.lineTo(90/100 * width - arrowWidth / 2, 10/100 * height + arrowHeight)
		ctx2.lineTo(90/100 * width + arrowWidth / 2, 10/100 * height + arrowHeight)
		ctx2.lineTo(90/100 * width, 10/100 * height)
		ctx2.fill()
		ctx2.closePath()
		
		// Horizontal arrow
		ctx2.beginPath()
		ctx2.moveTo(91/100 * width + arrowHeight, height / 2)
		ctx2.lineTo(91/100 * width, height / 2 - arrowWidth / 2)
		ctx2.lineTo(91/100 * width, height / 2 + arrowWidth / 2)
		ctx2.lineTo(91/100 * width + arrowHeight, height / 2)
		ctx2.fill()
		ctx2.closePath()
		
		// Axes names
		ctx2.fillText("Amplitude", 90/100 * width, 6/100 * height) 
		ctx2.fillText("Time", 95/100 * width, height / 2 + 4/100 * height) 
	}
	let drawGrid = () => {
		let verti = 21,
			hori = 6
			
		// Vertical lines
		let vStep = 1 / verti * 80/100 * width
		for (let v = 0; v <= verti; v++) {
			ctx3.beginPath()
			let x = 10/100 * width + v * vStep
			ctx3.moveTo(x, 10/100 * height)
			ctx3.lineTo(x, 90/100 * height)
			ctx3.stroke()
			ctx3.closePath()
		}
		
		// Horizontal lines
		let hStep = 1 / hori * 80/100 * height
		for (let h = 0; h <= hori; h++) {
			ctx3.beginPath()
			let y = 10/100 * height + h * hStep
			ctx3.moveTo(10/100 * width, y)
			ctx3.lineTo(90/100 * width, y)
			ctx3.stroke()
			ctx3.closePath()
		}
		
		// Scales in the corner
		// -> whole X range corresponds to 21.28 ms
		ctx3.moveTo(5/100 * width, 97/100 * height)
		ctx3.lineTo(5/100 * width + vStep, 97/100 * height)
		ctx3.stroke()
		ctx3.moveTo(5/100 * width, 97/100 * height)
		ctx3.lineTo(5/100 * width, 97/100 * height - hStep)
		ctx3.stroke()
		ctx3.fillText("50%", 3/100 * width, 91.5/100 * height)
		ctx3.fillText("1 ms", 7/100 * width, 100/100 * height)
	}
	
	// Canvas time loop
	let frame = 0
	let loop = () => {
		frame++
		
		// Clear everything on curve canvas
		ctx1.clearRect(0, 0, width, height)
		
		// Maybe clear or draw axes
		if (!C.axisToggle && axesAreDrawn) {
			ctx2.clearRect(0, 0, width, height)
			axesAreDrawn = false
		} else if (C.axisToggle && !axesAreDrawn) {
			drawAxes()
			axesAreDrawn = true
		}
		
		// Maybe clear of draw grid
		if (!C.gridToggle && gridIsDrawn) {
			ctx3.clearRect(0, 0, width, height)
			gridIsDrawn = false
		} else if (C.gridToggle && !gridIsDrawn) {
			drawGrid()
			gridIsDrawn = true
		}
		
		// Draw curve
		ctx1.beginPath()
		let step = (axesAreDrawn || gridIsDrawn ? 80/100 : 100/100) * width / F.timuDataArray.length
		// There are 1024 values to draw. We draw only 1/10 of them unless precision+ mode is active
		let increment = C.precisionToggle ? 1 : 10
		for (let i = 0; i < F.timuDataArray.length; i += increment) {
			let x = (axesAreDrawn || gridIsDrawn ? 10/100 * width : 0) + i * step
			let yCore = height - height * F.timuDataArray[i] / 255
			
			// Signal can range up to max 53% of graph height
			let y = axesAreDrawn || gridIsDrawn ? height / 2 + 53/100 * (yCore - height / 2) : yCore 
			
			if (i == 0) {
				ctx1.moveTo(x, y)
			} else {
				ctx1.lineTo(x, y)
			}
		}
		ctx1.stroke()
		ctx1.closePath()
		
		// Call next animation frame
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
	
}
let initFFTView = () => {
	// Canvas setup
	let ctx1 = document.getElementById('fft-canvas').getContext('2d')
	let container = document.getElementById('fft-container'),
		width = container.clientWidth,
		height = Math.min(container.clientHeight, 400)
		
	ctx1.canvas.width = width
	ctx1.canvas.height = height
	
	ctx1.lineWidth = 1
	ctx1.strokeStyle = 'white'
	
	// Canvas time loop
	let frame = 0
	let loop = () => {
		frame++
		
		ctx1.clearRect(0, 0, width, height)
		ctx1.beginPath()
		
		let step = width / F.frequDataArray.length
		let increment = C.precisionToggle ? 1 : 5
		for (let i = 0; i < F.frequDataArray.length; i += increment) {
			let x = i * step
			let y = height - height * F.frequDataArray[i] / 255
			if (i == 0) {
				ctx1.moveTo(x, y)
			} else {
				ctx1.lineTo(x, y)
			}
		}
		
		ctx1.stroke()
		ctx1.closePath()
		
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
}
let initTimefreqView = () => {
	// Canvas setup
	let ctx1 = document.getElementById('timefreq-canvas').getContext('2d')
	let container = document.getElementById('timefreq-container'),
		width = container.clientWidth,
		height = Math.min(container.clientHeight, 400)
		
	ctx1.canvas.width = width
	ctx1.canvas.height = height
	ctx1.globalCompositeOperation = 'lighter'
	//ctx1.filter = 'contrast(500%)'//'blur(2px) contrast(500%)'; /!\ Adds significant lag
	
	// Canvas background
	ctx1.fillStyle = 'black'
	ctx1.fillRect(0, 0, width, height)
	
	// Canvas time loop
	F.timefreqCtxTimerStart = new Date().getTime()
	let frame = 0,
		lastX = 0,
		X = 0,
		time = F.timefreqCtxTimerStart,
		radarMS = 4000, // ms
		sections = 50,
		zoneHeight = height / sections
		
	// Just analyse a proportion of all frequencies (lowest picthes)
	let rangeProportion = 0.3
		
	let loop = () => {
		frame++
		let newTime = new Date().getTime()
		
		// Radar over X axis
		X = width * ((newTime - F.timefreqCtxTimerStart) % radarMS) / radarMS
		
		// Paint wider rectangles if refresh time is longer
		let thickness = width * (newTime - time) / radarMS
		
		/*
		ctx1.beginPath()
		ctx1.fillStyle = 'black'
		ctx1.clearRect(X - thickness, 0, thickness, height)
		ctx1.closePath()
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
			ctx1.clearRect(X - thickness, y, thickness, zoneHeight)
			
			// Fill!
			ctx1.fillStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
			ctx1.fillRect(X - thickness, y, thickness, zoneHeight)
			
			// Draw a shadow circle around
			ctx1.beginPath()
			let radius = 0.7 * (zoneHeight + thickness)//Math.min(zoneHeight, thickness)//
			radius = Math.min(Math.min(radius, 2 * zoneHeight), 2 * thickness)
			
			ctx1.arc(X - thickness / 2, y + zoneHeight / 2, radius, 0, 2 * Math.PI, false)
			ctx1.fillStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha / 3 + ')'
			ctx1.fill()
			ctx1.closePath()
		}
		
		lastX = X
		time = newTime
		
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
}
let initCombinedView = () => {
	let container = document.getElementById('combined-container')
	
	// First canvas setup (radial timefreq)
	let ctx1 = document.getElementById('combined-timefreq-canvas').getContext('2d'),
		width1 = container.clientWidth,
		height1 = Math.min(container.clientHeight, 600)
		
	ctx1.canvas.width = width1
	ctx1.canvas.height = height1
	ctx1.imageSmoothingEnabled = true
	
	// Canvas background
	ctx1.fillStyle = 'black'
	ctx1.fillRect(0, 0, width1, height1)
	
	// Canvas time loop
	F.combinedCtxTimerStart = new Date().getTime()
	let frame1 = 0,
		lastTheta = 0,
		theta = 0,
		time = F.combinedCtxTimerStart,
		radarMS = 5000, // ms
		sections = 50,
		baseRadius = 100,
		maxRadius = 400,
		zoneHeight = (maxRadius - baseRadius) / sections,
		centerX = width1 / 2,
		centerY = height1 / 2
	
	// Just analyse a proportion of all frequencies (lowest picthes)
	let rangeProportion = 0.3
		
	let loop1 = () => {
		frame1++
		let newTime = new Date().getTime()
		
		// Radar over Theta
		theta = 2 * Math.PI * ((newTime - F.combinedCtxTimerStart) % radarMS) / radarMS
		
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
			ctx1.beginPath()
			ctx1.strokeStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
			ctx1.lineWidth = zoneHeight
			ctx1.arc(centerX, centerY, r + zoneHeight / 2, lastTheta, theta, false)
			ctx1.stroke()
			ctx1.closePath()
		}
		
		lastTheta = theta
		time = newTime
		
		window.requestAnimationFrame(loop1)
	}
	window.requestAnimationFrame(loop1)
	
	// Central circle to host oscilloscope canvas
	ctx1.beginPath()
	ctx1.strokeStyle = 'white'
	ctx1.lineWidth = 4
	ctx1.arc(centerX, centerY, 98, 0, 2 * Math.PI, false)
	ctx1.stroke()
	ctx1.closePath()
	
	// Second canvas setup (oscilloscope)
	let ctx2 = document.getElementById('combined-oscilloscope-canvas').getContext('2d')
	let width2 = 200,
		height2 = 200
		
	ctx2.canvas.width = width2
	ctx2.canvas.height = height2
	
	ctx2.lineWidth = 1
	ctx2.strokeStyle = 'white'
	
	// Canvas time loop
	let frame2 = 0
	let loop2 = () => {
		frame2++
		
		ctx2.clearRect(0, 0, width2, height2)
		ctx2.beginPath()
		
		let l = F.timuDataArray.length,
			step = width2 / l
		for (let i = 0; i < F.timuDataArray.length; i += 5) {
			let y = height2 * (255 - F.timuDataArray[i]) / 255
			y = height2 / 2 + 0.8 * (y - height2 / 2) * Math.pow(Math.sin(Math.PI * i / l), 2)

			if (i == 0) {
				ctx2.moveTo(0, y)
			} else {
				ctx2.lineTo(i * step, y)
			}
			
		}
		
		ctx2.stroke()
		
		window.requestAnimationFrame(loop2)
	}
	window.requestAnimationFrame(loop2)
	
}

let startAudio = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	F.osci = new OscillatorNode(F.audioContext, {
		frequency: 440,
		type: "sine" // "sine", "square", "sawtooth", "triangle"
	})
	
	// Create gain node
	F.gain = new GainNode(F.audioContext)
	F.gain.gain.value = 1
	
	// Create audio analyzer
	F.analyser = new AnalyserNode(F.audioContext) // Created with FFT size of 2048 (2^11)
	const bufferLength = F.analyser.frequencyBinCount // 1024
	F.timuDataArray = new Uint8Array(bufferLength) // Full of zeros (1024 == 2^10)
	F.frequDataArray = new Uint8Array(bufferLength)
	
	// Calibrate reactivity (more or less averaged with previous value), 0.8 is default, 0 is not averaged and thus super reactive, and 1 the maximum
	F.analyser.smoothingTimeConstant = 0
	
	// Start oscillator
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
		F.osci.frequency.value = 100 + 100 * Math.floor(30 * Math.random())//2100 + 2000 * Math.sin(t / 3)
	}, 500)
	
}
let startOscillator = () => {
	F.gain.gain.value = 1
	
	// Link oscillator to audio context destination (for hearing) with a gain node inbetween them
	F.osci.connect(F.gain)
	F.gain.connect(F.audioContext.destination)
	
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
			F.gain.gain.value = 1
			F.mike = F.audioContext.createMediaStreamSource(stream)
			// Link to destination for hearing (with gain inbetween)
			F.mike.connect(F.gain)
			F.gain.connect(F.audioContext.destination)
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
	// Don't kill the audio nodes but just disconnect from analyser and output
	F.osci.disconnect(F.analyser)
	F.osci.disconnect(F.gain)
	F.gain.disconnect(F.audioContext.destination)
}
let stopMicrophone = () => {
	// Don't kill the audio nodes but just disconnect from analyser and output
	F.mike.disconnect(F.analyser)
	F.mike.disconnect(F.gain)
	F.gain.disconnect(F.audioContext.destination)
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	// Audio buttons 
	dom.buttons.audioStart.addEventListener('click', () => {
		// Display the other buttons
		dom.buttons.audioStart.classList.add('hidden')
		dom.buttons.mikeStart.classList.remove('hidden')
		dom.buttons.oscillatorStart.classList.remove('hidden')
		
		// Display the other tabs
		Array.from(dom.navTabs).forEach((el) => {
			el.classList.remove('hidden')
		})
		
		// Do some global audio init
		startAudio()
	})
	dom.buttons.mikeStart.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		//dom.buttons.mikeStop.classList.remove('hidden')
		dom.buttons.mikeStart.classList.add('hidden')
		dom.buttons.oscillatorStart.classList.add('hidden')
		
		startMicrophone()
		
		// Show mute button
		dom.buttons.audioMute.classList.remove('hidden')
	})
	dom.buttons.oscillatorStart.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.buttons.oscillatorStop.classList.remove('hidden')
		dom.buttons.oscillatorStart.classList.add('hidden')
		dom.buttons.mikeStart.classList.add('hidden')
		
		startOscillator()
		
		// Show mute button
		dom.buttons.audioMute.classList.remove('hidden')
	})
	/*
	dom.buttons.mikeStop.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.buttons.mikeStop.classList.add('hidden')
		dom.buttons.mikeStart.classList.remove('hidden')
		dom.buttons.oscillatorStart.classList.remove('hidden')
		
		stopMicrophone()
		
		// Show hide mute&unmute button
		dom.buttons.audioMute.classList.add('hidden')
		dom.buttons.audioUnmute.classList.add('hidden')
	})
	*/
	dom.buttons.oscillatorStop.addEventListener('click', () => {
		// Toggle start/stop button hidden status
		dom.buttons.oscillatorStop.classList.add('hidden')
		dom.buttons.oscillatorStart.classList.remove('hidden')
		dom.buttons.mikeStart.classList.remove('hidden')
		
		stopOscillator()
		
		// Hide mute&unmute buttons
		dom.buttons.audioMute.classList.add('hidden')
		dom.buttons.audioUnmute.classList.add('hidden')
	})
	dom.buttons.audioMute.addEventListener('click', () => {
		F.gain.gain.value = 0
		
		// Toggle mute/unmute .hidden status
		dom.buttons.audioMute.classList.add('hidden')
		dom.buttons.audioUnmute.classList.remove('hidden')
	})
	dom.buttons.audioUnmute.addEventListener('click', () => {
		F.gain.gain.value = 1
		
		// Toggle mute/unmute .hidden status
		dom.buttons.audioUnmute.classList.add('hidden')
		dom.buttons.audioMute.classList.remove('hidden')
	})
	
	initNavAndViewMechanics()
	
	// Init on #home view
	loadView('home')
	setActiveTab(document.getElementById('home'))
	
})
