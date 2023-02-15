/**
 * Main script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022-2023
 */

let myVerySpecialInputScaling = 0.95

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
	activeView: 'home',
	viewIsInit: {
		osci: false,
		fft: false,
		timefreq: false,
		combined: false
	},
	oscilloscope: {
		lineColor: 'hsla(140, 100%, 60%, 1)'
	},
	fft: {
		lineColor: 'hsla(0, 100%, 55%, 1)'
	},
	timefreq: {
		baseTime: undefined
	},
	combined: {
		baseTime: undefined,
		centerX: undefined,
		centerY: undefined,
		baseRadius: 100,
		maxRadius: 600
	},
	grids: {
		axesColor: 'white',
		scalesStrokeColor: 'rgba(255, 255, 255, 0.3)',
		scalesTextColor: 'rgba(255, 255, 255, 0.6)'
	}
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
	document.getElementById('home').addEventListener('click', (ev) => {
		loadView('home')
		resetActivatedTab()
		setActiveTab(ev.target)
	})
	
	document.getElementById('oscilloscope').addEventListener('click', (ev) => {
		loadView('oscilloscope')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		if (!F.viewIsInit.osci) {
			initOscilloscopeView()
			F.viewIsInit.osci = true
		}
	})
	
	document.getElementById('fft').addEventListener('click', (ev) => {
		loadView('fft')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		if (!F.viewIsInit.fft) {
			initFFTView()
			F.viewIsInit.fft = true
		}
	})
	
	document.getElementById('timefreq').addEventListener('click', (ev) => {
		loadView('timefreq')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		if (!F.viewIsInit.timefreq) {
			initTimefreqView()
			F.viewIsInit.timefreq = true
		}
	})
	
	document.getElementById('combined').addEventListener('click', (ev) => {
		loadView('combined')
		resetActivatedTab()
		setActiveTab(ev.target)
		
		if (!F.viewIsInit.combined) {
			initCombinedView()
			F.viewIsInit.combined = true
		}
	})
}
let configureCanvas = (ctx, width, height) => {
	ctx.canvas.width = width * window.devicePixelRatio
	ctx.canvas.height = height * window.devicePixelRatio
	ctx.canvas.style.width = width + "px"
	ctx.canvas.style.height = height + "px"
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
	ctx.lineWidth = 1
}

let initOscilloscopeView = () => {
	// Canvas setup
	let ctx1 = document.getElementById('oscilloscope-curve-canvas').getContext('2d')
	let ctx2 = document.getElementById('oscilloscope-axes-canvas').getContext('2d')
	let ctx3 = document.getElementById('oscilloscope-grid-canvas').getContext('2d')
	
	let container = document.getElementById('oscilloscope-container')
	let width = container.clientWidth
	let height = Math.min(container.clientHeight, 500)
	
	// Canvas configurations
	configureCanvas(ctx1, width, height)
	ctx1.strokeStyle = F.oscilloscope.lineColor
	
	configureCanvas(ctx2, width, height)
	ctx2.strokeStyle = F.grids.axesColor
	ctx2.fillStyle = F.grids.axesColor
	ctx2.font = '15px Raleway'
	ctx2.textAlign = 'center'
	
	configureCanvas(ctx3, width, height)
	ctx3.strokeStyle = F.grids.scalesStrokeColor
	ctx3.fillStyle = F.grids.scalesTextColor
	ctx3.font = '13px Raleway'
	ctx3.textAlign = 'center'
	
	let axesAreDrawn = false
	let gridIsDrawn = false
	let lastXscale = C.oscilloscope.scale.x
	let lastYscale = C.oscilloscope.scale.y
	
	// Canvas time loop
	let frame = 0
	let loop = () => {
		
		// Work on canvases only if view is active
		if (F.activeView == 'oscilloscope') {
			frame++
			
			// Clear everything on curve canvas
			ctx1.clearRect(0, 0, width, height)
		
			// Maybe clear or draw axes
			if (!C.oscilloscope.axisToggle && axesAreDrawn) {
				ctx2.clearRect(0, 0, width, height)
				axesAreDrawn = false
			} else if (C.oscilloscope.axisToggle && !axesAreDrawn) {
				drawAxes('oscilloscope', ctx2, width, height)
				axesAreDrawn = true
			}
			
			let gridVertiCuts = C.oscilloscope.scale.x == 0 ? 20 : (C.oscilloscope.scale.x == 1 ? 10 : 2)
			let gridHoriCuts = C.oscilloscope.scale.y == 0 ? 8 : (C.oscilloscope.scale.y == 1 ? 6 : 4)
			// Maybe clear or draw grid
			if (!C.oscilloscope.gridToggle && gridIsDrawn) {
				ctx3.clearRect(0, 0, width, height)
				gridIsDrawn = false
			} else if (C.oscilloscope.gridToggle && !gridIsDrawn) {
				drawGrid('oscilloscope', ctx3, width, height, gridVertiCuts, gridHoriCuts)
				gridIsDrawn = true
			}
			
			// If scale has changed, redraw grid (and thus scales)
			if (C.oscilloscope.gridToggle && (lastXscale != C.oscilloscope.scale.x || lastYscale != C.oscilloscope.scale.y)) {
				ctx3.clearRect(0, 0, width, height)
				drawGrid('oscilloscope', ctx3, width, height, gridVertiCuts, gridHoriCuts)
				lastXscale = C.oscilloscope.scale.x
				lastYscale = C.oscilloscope.scale.y
			}
			
			// Draw curve
			ctx1.beginPath()
			let step = (axesAreDrawn || gridIsDrawn ? 80/100 : 100/100) * width / F.timuDataArray.length
			
			let timeData = F.timuDataArray // Full 2048 array
			// Chop down array if we have zoomed scale to keep just the first values (most recent milliseconds of signal)
			let chopFactor = C.oscilloscope.scale.x == 0 ? 1 : (C.oscilloscope.scale.x == 1 ? 2 : 10)
			let yScale = C.oscilloscope.scale.y == 0 ? 1 : (C.oscilloscope.scale.y == 1 ? 2 : 10)
			timeData = timeData.slice(0, timeData.length / chopFactor)
			let increment = C.oscilloscope.precisionToggle ? 1 : Math.floor(timeData.length / 200) // Draw all values or just 200 values
			for (let i = 0; i < timeData.length; i += increment) {
				let x = (axesAreDrawn || gridIsDrawn ? 10/100 * width : 0) + i * step * chopFactor
				let yCore = height - height * timeData[i] / 255
				let yGridScale = axesAreDrawn || gridIsDrawn ? 80/100 : 90/100
				let y = height / 2 + yGridScale * yScale * myVerySpecialInputScaling * (yCore - height / 2) // Signal can range up to max 53% or 90% of canvas height
				
				// Cap
				y = Math.min(y, height / 2 + height * yGridScale / 2)
				y = Math.max(y, height / 2 - height * yGridScale / 2)
				
				if (i == 0) {
					ctx1.moveTo(x, y)
				} else {
					ctx1.lineTo(x, y)
				}
				
			}
			ctx1.stroke()
			ctx1.closePath()
		}
		
		// Call next animation frame
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
}
let initFFTView = () => {
	// Canvas setup
	let ctx1 = document.getElementById('fft-curve-canvas').getContext('2d')
	let ctx2 = document.getElementById('fft-axes-canvas').getContext('2d')
	let ctx3 = document.getElementById('fft-grid-canvas').getContext('2d')
	
	let container = document.getElementById('fft-container')
	let width = container.clientWidth
	let height = Math.min(container.clientHeight, 400)
	
	// Canvas configuration
	configureCanvas(ctx1, width, height)
	ctx1.strokeStyle = F.fft.lineColor
	
	configureCanvas(ctx2, width, height)
	ctx2.strokeStyle = F.grids.axesColor
	ctx2.fillStyle = F.grids.axesColor
	ctx2.font = '15px Raleway'
	ctx2.textAlign = 'center'
	
	configureCanvas(ctx3, width, height)
	ctx3.strokeStyle = F.grids.scalesStrokeColor
	ctx3.fillStyle = F.grids.scalesTextColor
	ctx3.font = '13px Raleway'
	
	let axesAreDrawn = false
	let gridIsDrawn = false
	
	// Canvas time loop
	let frame = 0
	let loop = () => {
		
		// Work on canvases only if view is active
		if (F.activeView == 'fft') {
			frame++
			
			// Clear everything on curve canvas
			ctx1.clearRect(0, 0, width, height)
			
			// Maybe clear or draw axes
			if (!C.fft.axisToggle && axesAreDrawn) {
				ctx2.clearRect(0, 0, width, height)
				axesAreDrawn = false
			} else if (C.fft.axisToggle && !axesAreDrawn) {
				drawAxes('fft', ctx2, width, height)
				axesAreDrawn = true
			}
			
			// Maybe clear or draw grid
			if (!C.fft.gridToggle && gridIsDrawn) {
				ctx3.clearRect(0, 0, width, height)
				gridIsDrawn = false
			} else if (C.fft.gridToggle && !gridIsDrawn) {
				drawGrid('fft', ctx3, width, height, 24, 10)
				gridIsDrawn = true
			}
			
			// Draw curve
			ctx1.beginPath()
			let step = (axesAreDrawn || gridIsDrawn ? 80/100 : 100/100) * width / F.frequDataArray.length
			let increment = C.fft.precisionToggle ? 1 : 5 // There are 2048 values to draw. We draw only 1/5 of them unless precision+ mode is active
			for (let i = 0; i < F.frequDataArray.length; i += increment) {
				let x = (axesAreDrawn || gridIsDrawn ? 10/100 * width : 0) + i * step
				let y = (axesAreDrawn || gridIsDrawn) ?
				(90/100 * height - 80/100 * height * F.frequDataArray[i] / 255) : (height - height * F.frequDataArray[i] / 255)
				
				if (i == 0) {
					ctx1.moveTo(x, y)
				} else {
					ctx1.lineTo(x, y)
				}
			}
			ctx1.stroke()
			ctx1.closePath()
		}
		
		// Call next animation frame
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
}
let initTimefreqView = () => {
	// Canvas setup
	let ctx1 = document.getElementById('timefreq-curve-canvas').getContext('2d')
	let ctx2 = document.getElementById('timefreq-axes-canvas').getContext('2d')
	let ctx3 = document.getElementById('timefreq-grid-canvas').getContext('2d')
	
	let container = document.getElementById('timefreq-container')
	let width = container.clientWidth
	let height = Math.min(container.clientHeight, 400)
	
	// Canvas configurations
	configureCanvas(ctx1, width, height)
	ctx1.globalCompositeOperation = 'lighter'
	//ctx1.filter = 'contrast(500%)'//'blur(2px) contrast(500%)'; /!\ Adds significant lag
	
	configureCanvas(ctx2, width, height)
	ctx2.strokeStyle = F.grids.axesColor
	ctx2.fillStyle = F.grids.axesColor
	ctx2.font = '15px Raleway'
	ctx2.textAlign = 'center'
	
	configureCanvas(ctx3, width, height)
	ctx3.strokeStyle = F.grids.scalesStrokeColor
	ctx3.fillStyle = F.grids.scalesTextColor
	ctx3.font = '13px Raleway'
	
	let axesAreDrawn = false
	let gridIsDrawn = false
	let lastYscale = C.timefreq.scale.y
	
	// Canvas time loop
	F.timefreq.baseTime = new Date().getTime()
	let frame = 0,
		lastX = 0,
		X = 0,
		lastTime = F.timefreq.baseTime,
		radarMS = 4000, // ms
		sections = 64,
		zoneHeight = height / sections
	
	let loop = () => {
		
		// Work on canvases only if view is active
		if (F.activeView == 'timefreq') {
			frame++
			
			// Maybe clear or draw axes
			if (!C.timefreq.axisToggle && axesAreDrawn) {
				ctx2.clearRect(0, 0, width, height)
				axesAreDrawn = false
				if (!gridIsDrawn) {
					ctx1.clearRect(0, 0, width, height)
					F.timefreq.baseTime = new Date().getTime()
					lastTime = F.timefreq.baseTime
				}
			} else if (C.timefreq.axisToggle && !axesAreDrawn) {
				drawAxes('timefreq', ctx2, width, height)
				axesAreDrawn = true
				if (!gridIsDrawn) {
					ctx1.clearRect(0, 0, width, height)
					F.timefreq.baseTime = new Date().getTime()
					lastTime = F.timefreq.baseTime
				}
			}
			
			// If scale has changed, clear curve grid (and thus scales)
			if (lastYscale != C.timefreq.scale.y) {
				ctx1.clearRect(0, 0, width, height)
				ctx3.clearRect(0, 0, width, height)
				gridIsDrawn = false
				lastYscale = C.timefreq.scale.y
			}
			
			// Maybe clear or draw grid
			if (!C.timefreq.gridToggle && gridIsDrawn) {
				ctx3.clearRect(0, 0, width, height)
				gridIsDrawn = false
				if (!axesAreDrawn) {
					ctx1.clearRect(0, 0, width, height)
					F.timefreq.baseTime = new Date().getTime()
					lastTime = F.timefreq.baseTime
				}
			} else if (C.timefreq.gridToggle && !gridIsDrawn) {
				let gridHoriCuts = C.timefreq.scale.y == 0 ? 12 : (C.timefreq.scale.y == 1 ? 8 : 4)
				drawGrid('timefreq', ctx3, width, height, 16, gridHoriCuts)
				gridIsDrawn = true
				if (!axesAreDrawn) {
					ctx1.clearRect(0, 0, width, height)
					F.timefreq.baseTime = new Date().getTime()
					lastTime = F.timefreq.baseTime
				}
			}
			
			// Work on 'curve' canvas
			if (lastTime == F.timefreq.baseTime) {
				// Means another view was active --> clear zone
				ctx1.clearRect(0, 0, width, height)
			}
			let newTime = new Date().getTime()
			
			// Radar over X axis
			let xCore = width * ((newTime - F.timefreq.baseTime) % radarMS) / radarMS
			let X = axesAreDrawn || gridIsDrawn ? 10/100 * width + 80/100 * xCore : xCore
			
			// Paint wider rectangles if refresh time is longer
			let thickness = width * (newTime - lastTime) / radarMS * (axesAreDrawn || gridIsDrawn ? 80/100 : 100/100)
			
			// Just analyse a proportion of all frequencies (lowest picthes)
			let rangeProportion = C.timefreq.scale.y == 0 ? 1 : (C.timefreq.scale.y == 1 ? 0.3 : 0.1)
			
			for (let s = 0; s < sections; s++) {
				let sectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * s)
				let nextSectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * (s + 1))
				let maxSampleValue = 0 // Better to use max than average because of freq data scarcity for perfect signals
				for (let i = sectionSampleIndex; i < nextSectionSampleIndex; i++) {
					let sampleValue = F.frequDataArray[i]
					if (sampleValue > maxSampleValue) maxSampleValue = sampleValue
				}
					
				// Position of colored zone
				let yCore = height - height * s / sections
				let y = axesAreDrawn || gridIsDrawn ? 10/100 * height + 80/100 * yCore : yCore
				
				// Colors
				let hue = 260 - maxSampleValue / 255 * 60
				let lum = 0.4 + 0.6 * maxSampleValue / 255 * 100
				let alpha = maxSampleValue / 255 * 2.0
				
				// Clear previous
				ctx1.clearRect(X, y - zoneHeight, thickness + 1, zoneHeight)
				
				// Fill!
				ctx1.fillStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
				ctx1.beginPath()
				let maxWidth = width * (axesAreDrawn || gridIsDrawn ? 90/100 : 100/100)
				if (X + thickness < maxWidth) ctx1.fillRect(X, y - zoneHeight, thickness, zoneHeight)
				ctx1.closePath()
			}
			
			lastX = X
			lastTime = newTime
		} else {
			F.timefreq.baseTime = new Date().getTime()
			lastTime = F.timefreq.baseTime
		}
		
		window.requestAnimationFrame(loop)
	}
	window.requestAnimationFrame(loop)
}
let initCombinedView = () => {
	let container = document.querySelector('#combined-container .canvas-container')
	
	let ctx1 = document.getElementById('combined-timefreq-canvas').getContext('2d')
	let ctx2 = document.getElementById('combined-oscilloscope-canvas').getContext('2d')
	let ctx3 = document.getElementById('combined-grid-canvas').getContext('2d')
	let width1 = container.clientWidth
	let height1 = container.clientHeight//Math.min(container.clientHeight, 500)
	let width2 = 200
	let height2 = 200
	
	// Radial radar
	configureCanvas(ctx1, width1, height1)
	ctx1.imageSmoothingEnabled = true
	F.combined.centerX = width1 / 2
	F.combined.centerY = height1 / 2
	let centerX = F.combined.centerX
	let centerY = F.combined.centerY
	ctx1.fillStyle = 'black'
	ctx1.strokeStyle = 'white'
	ctx1.fillRect(0, 0, width1, height1)
	
	// Tiny oscilloscope
	configureCanvas(ctx2, width2, height2)
	ctx2.strokeStyle = 'white'
	
	// Grid
	configureCanvas(ctx3, width1, height1)
	ctx3.strokeStyle = F.grids.scalesStrokeColor
	ctx3.fillStyle = F.grids.scalesTextColor
	ctx3.font = '13px Raleway'
	
	let gridIsDrawn = false
	let lastYscale = C.combined.scale.y
	
	// Radial radar time loop
	F.combined.baseTime = new Date().getTime()
	let frame1 = 0,
		lastTheta = 0,
		theta = 0,
		lastTime = F.combined.baseTime,
		radarMS = 5000, // ms
		sections = 50,
		baseRadius = F.combined.baseRadius,
		maxRadius = F.combined.maxRadius,
		zoneHeight = (maxRadius - baseRadius) / sections
	
	let loop1 = () => {
		
		// Work on canvases only if view is active
		if (F.activeView == 'combined') {
			frame1++
			
			// If scale has changed, clear curve grid (and thus scales)
			if (lastYscale != C.combined.scale.y) {
				ctx1.clearRect(0, 0, width1, height1)
				ctx3.clearRect(0, 0, width1, height1)
				gridIsDrawn = false
				lastYscale = C.combined.scale.y
			}
			
			// Maybe clear or draw grid
			if (!C.combined.gridToggle && gridIsDrawn) {
				ctx3.clearRect(0, 0, width1, height1)
				gridIsDrawn = false
			} else if (C.combined.gridToggle && !gridIsDrawn) {
				drawGrid('combined', ctx3, width1, height1)
				gridIsDrawn = true
			}
			
			// Radar time
			let newTime = new Date().getTime()
			
			// Radar over Theta
			theta = 2 * Math.PI * ((newTime - F.combined.baseTime) % radarMS) / radarMS
			
			// Paint wider arcs (in theta) if refresh time is longer
			let thetaRange = 2 * Math.PI * (newTime - lastTime) / radarMS
			
			// Just analyse a proportion of all frequencies (lowest picthes)
			let rangeProportion = C.combined.scale.y == 0 ? 1 : (C.combined.scale.y == 1 ? 0.3 : 0.1)
			
			for (let s = 0; s < sections; s++) {
				let sectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * s)
				let nextSectionSampleIndex = Math.floor(F.frequDataArray.length * rangeProportion / sections * (s + 1))
				let maxSampleValue = 0 // Better to use max than average because of freq data scarcity for perfect signals
				for (let i = sectionSampleIndex; i < nextSectionSampleIndex; i++) {
					let sampleValue = F.frequDataArray[i]
					if (sampleValue > maxSampleValue) maxSampleValue = sampleValue
				}
				
				let r = baseRadius + (maxRadius - baseRadius) * s / sections
				
				// Colors				
				let hue = 260 - maxSampleValue / 255 * 60
				let lum = 0.4 + 0.6 * maxSampleValue / 255 * 100
				let alpha = maxSampleValue / 255 * 2.0
				
				// Draw new arc
				ctx1.beginPath()
				ctx1.strokeStyle = 'hsla(' + hue + ', 80%, ' + lum + '%, ' + alpha + ')'
				ctx1.lineWidth = zoneHeight
				ctx1.arc(centerX, centerY, r + zoneHeight / 2, lastTheta, theta, false)
				ctx1.stroke()
				ctx1.closePath()
			}
			
			lastTheta = theta
			lastTime = newTime
		}
		
		window.requestAnimationFrame(loop1)
	}
	window.requestAnimationFrame(loop1)
	
	// Tiny oscilloscope time loop
	let frame2 = 0
	let loop2 = () => {
		
		// Work on canvases only if view is active
		if (F.activeView == 'combined') {
			frame2++
			
			ctx2.clearRect(0, 0, width2, height2)
			
			// Central circle that contains oscilloscope
			ctx2.beginPath()
			ctx2.lineWidth = 4
			ctx2.strokeStyle = 'white'
			ctx2.arc(width2 / 2, height2 / 2, 98, 0, 2 * Math.PI, false)
			ctx2.stroke()
			ctx2.closePath()
			
			ctx2.beginPath()
			ctx2.lineWidth = 1
			
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
			ctx2.closePath()
		}
		
		window.requestAnimationFrame(loop2)
	}
	window.requestAnimationFrame(loop2)
}
let drawAxes = (type, ctx, width, height) => {
	// type can be 'oscilloscope', 'fft', 'timefreq' or 'combined'
	
	// Axes
	let yHoriAxis = type == 'oscilloscope' ? height / 2 : 90/100 * height
	// Horizontal axis
	ctx.beginPath()
	ctx.moveTo(10/100 * width, yHoriAxis)
	ctx.lineTo(92/100 * width, yHoriAxis)
	ctx.stroke()
	ctx.closePath()
	
	// Vertical axis
	let xVertiAxis = type == 'oscilloscope' ? 90/100 * width : 10/100 * width
	ctx.beginPath()
	ctx.moveTo(xVertiAxis, 90/100 * height)
	ctx.lineTo(xVertiAxis, 15/100 * height)
	ctx.stroke()
	ctx.closePath()
	
	// Arrows
	let arrowWidth = 0.75/100 * width
	let arrowHeight = 5/100 * height
	
	// Horizontal arrow
	ctx.beginPath()
	ctx.moveTo(91/100 * width + arrowHeight, yHoriAxis)
	ctx.lineTo(91/100 * width, yHoriAxis - arrowWidth / 2)
	ctx.lineTo(91/100 * width, yHoriAxis + arrowWidth / 2)
	ctx.lineTo(91/100 * width + arrowHeight, yHoriAxis)
	ctx.fill()
	ctx.closePath()
	
	// Vertical arrow
	ctx.beginPath()
	ctx.moveTo(xVertiAxis, 10/100 * height)
	ctx.lineTo(xVertiAxis - arrowWidth / 2, 10/100 * height + arrowHeight)
	ctx.lineTo(xVertiAxis + arrowWidth / 2, 10/100 * height + arrowHeight)
	ctx.lineTo(xVertiAxis, 10/100 * height)
	ctx.fill()
	ctx.closePath()
	
	// Axes names
	let axis1name, axis2name, text1x, text1y, text2x, text2y
	if (type == 'oscilloscope') {
		axis1name = "Value (%)"
		axis2name = "Time (ms)"
		text1x = 90/100 * width
		text1y = 6/100 * height
		text2x = 95/100 * width
		text2y = height / 2 + 4/100 * height
	} else if (type == 'fft') {
		axis1name = "Power (dB)"
		axis2name = "Frequency (kHz)"
		text1x = 10/100 * width
		text1y = 6/100 * height
		text2x = 90/100 * width
		text2y = 98/100 * height
	} else if (type == 'timefreq') {
		axis1name = "Frequency (kHz)"
		axis2name = "Time (s)"
		text1x = 10/100 * width
		text1y = 6/100 * height
		text2x = 95/100 * width
		text2y = 96/100 * height
	}
	ctx.textAlign = 'center'
	ctx.fillText(axis1name, text1x, text1y) 
	ctx.fillText(axis2name, text2x, text2y)
}
let drawGrid = (type, ctx, width, height, vertiCuts, horiCuts) => {
	// type can be 'oscilloscope', 'fft', 'timefreq' or 'combined'
	
	// Grid
	let vStep, hStep	
	if (type != 'combined') {
		// Vertical lines
		vStep = 1 / vertiCuts * 80/100 * width
		for (let v = 0; v <= vertiCuts; v++) {
			ctx.beginPath()
			let x = 10/100 * width + v * vStep
			ctx.moveTo(x, 10/100 * height)
			ctx.lineTo(x, 90/100 * height)
			ctx.stroke()
			ctx.closePath()
		}
		
		// Horizontal lines
		hStep = 1 / horiCuts * 80/100 * height
		for (let h = 0; h <= horiCuts; h++) {
			ctx.beginPath()
			let y = 10/100 * height + h * hStep
			ctx.moveTo(10/100 * width, y)
			ctx.lineTo(90/100 * width, y)
			ctx.stroke()
			ctx.closePath()
		}
	} else if (type == 'combined') {
		// Radial lines
		let thetaStep = Math.PI / 12
		let r1 = 100
		let r2 = 600
		for (let t = thetaStep; t < 2 * Math.PI; t += thetaStep) {
			ctx.beginPath()
			let x1 = F.combined.centerX + r1 * Math.cos(t)
			let y1 = F.combined.centerY + r1 * Math.sin(t)
			let x2 = F.combined.centerX + r2 * Math.cos(t)
			let y2 = F.combined.centerY + r2 * Math.sin(t)
			ctx.moveTo(x1, y1)
			ctx.lineTo(x2, y2)
			ctx.stroke()
			ctx.closePath()
		}
		
		// Orthoradial lines (circles)
		let rMin = 100, rMax = 600, iMax = C.combined.scale.y == 0 ? 12 : (C.combined.scale.y == 1 ? 8 : 4)
		for (let i = 0; i <= iMax; i++) {
			let r = rMin + i / iMax * (rMax - rMin)
			ctx.beginPath()
			ctx.arc(F.combined.centerX, F.combined.centerY, r, 0, 2 * Math.PI, false)
			ctx.stroke()
			ctx.closePath()
		}
	}
	
	// Scales
	if (type == 'oscilloscope') {
		// Horizontal scales
		let vStep = 1 / vertiCuts * 80/100 * width
		for (let v = 0; v <= vertiCuts; v++) {
			let x = 10/100 * width + v * vStep
			ctx.textAlign = 'center'
			let text = 0 - 40 * (vertiCuts - v) / vertiCuts// unzoomed graph spans 40ms
			text *= C.oscilloscope.scale.x == 0 ? 1 : (C.oscilloscope.scale.x == 1 ? 1/2 : 1/10)
			ctx.fillText(text, x, 93.5/100 * height)
		}
		// Vertical scales
		let hStep = 1 / horiCuts * 80/100 * height
		for (let h = 0; h <= horiCuts; h++) {
			let y = 10.8/100 * height + h * hStep
			ctx.textAlign = 'right'
			let text = Math.abs(Math.round(100 * (horiCuts - 2*h) / horiCuts))
			text *= C.oscilloscope.scale.y == 0 ? 1 : (C.oscilloscope.scale.y == 1 ? 1/2 : 1/10)
			ctx.fillText(text, 9/100 * width, y)
		}
	} else if (type == 'fft') {
		// Horizontal scales
		let vStep = 1 / vertiCuts * 80/100 * width
		for (let v = 0; v <= vertiCuts; v++) {
			let x = 10/100 * width + v * vStep
			ctx.textAlign = 'center'
			ctx.fillText(v, x, 93.5/100 * height)
		}
		// Vertical scales
		let hStep = 1 / horiCuts * 80/100 * height
		for (let h = 0; h <= horiCuts; h++) {
			let y = 11.2/100 * height + h * hStep
			ctx.textAlign = 'right'
			ctx.fillText(-10 * h, 9/100 * width, y)
		}
	} else if (type == 'timefreq') {
		// Vertical scales
		let hStep = 1 / horiCuts * 80/100 * height
		for (let h = 0; h <= horiCuts; h++) {
			let y = 91.0/100 * height - h * hStep
			ctx.textAlign = 'right'
			let step = h / horiCuts * (C.timefreq.scale.y == 0 ? 24 : (C.timefreq.scale.y == 1 ? 24/3 : 24/10))
			ctx.fillText(Math.round(10 * step) / 10, 9/100 * width, y)
		}
	} else if (type == 'combined') {
		// Radial scales (one per circle)
		let rMin = 100, rMax = 600, iMax = C.combined.scale.y == 0 ? 12 : (C.combined.scale.y == 1 ? 8 : 4), maxFreq = C.combined.scale.y == 0 ? 24 : (C.combined.scale.y == 1 ? 8 : 2.4)
		for (let i = 0; i <= iMax; i++) {
			let r = rMin + i / iMax * (rMax - rMin)
			let freq = 0 + i / iMax * maxFreq
			ctx.textAlign = 'left'
			ctx.fillText(Math.floor(freq * 10) / 10, F.combined.centerX + r + 4, F.combined.centerY - 6)
		}
	}
	
}

let startAudio = () => {
	// Create main audio context with 48kHz sample rate
	F.audioContext = new AudioContext({ sampleRate: 48000 })
	
	// Create oscillator source node
	F.osci = new OscillatorNode(F.audioContext, {
		frequency: 440,
		type: "triangle" // "sine", "square", "sawtooth", "triangle"
	})
	
	// Create gain node
	F.gain = new GainNode(F.audioContext)
	F.gain.gain.value = 1
	
	// Create audio analyzer
	F.analyser = new AnalyserNode(F.audioContext, {fftSize: 4096}) // Default is FFT size of 2048 (2^11), we there ask for twice more data
	const bufferLength = F.analyser.frequencyBinCount // == exactly half fftSize, so here 2048
	F.timuDataArray = new Uint8Array(bufferLength) // Full of zeros (1024 == 2^10)
	F.frequDataArray = new Uint8Array(bufferLength)
	
	// Calibrate reactivity (more or less averaged with previous value), 0.8 is default, 0 is not averaged and thus super reactive, and 1 the maximum
	F.analyser.smoothingTimeConstant = 0.2
	
	F.analyser.minDecibels = -100
	F.analyser.maxDecibels = 0
	
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
		F.osci.frequency.value = 2500 + 1500 * Math.sin(t * 0.5)//0 + 100 * Math.pow(2, Math.floor(80 * Math.random()) / 12)
	}, 500)
	
}
let startOscillator = () => {
	F.gain.gain.value = 1
	
	// Link oscillator to audio context destination (for hearing) with a gain node inbetween them
	F.osci.connect(F.gain)
	F.gain.connect(F.audioContext.destination)
	
	// Don't forget to connect it with analyser!
	F.osci.connect(F.analyser)
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
