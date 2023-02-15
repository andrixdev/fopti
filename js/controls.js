/**
 * Controls script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022-2023
 */

let C = {
	oscilloscope: {
		controlsNode: document.querySelector('#oscilloscope-container .controls'),
		axisToggle: false,
		gridToggle: false,
		precisionToggle: false,
		scale: {
			x: 0,// 0, 1 or 2
			y: 0// 0, 1 or 2
		}
	},
	fft: {
		controlsNode: document.querySelector('#fft-container .controls'),
		axisToggle: false,
		gridToggle: false,
		precisionToggle: false,
		scale: {
			x: 0,
			y: 0
		}
	},
	timefreq: {
		controlsNode: document.querySelector('#timefreq-container .controls'),
		axisToggle: false,
		gridToggle: false,
		precisionToggle: false,
		scale: {
			x: 0,
			y: 0
		}
	},
	combined: {
		controlsNode: document.querySelector('#combined-container .controls'),
		axisToggle: false,
		gridToggle: false,
		precisionToggle: false,
		scale: {
			x: 0,
			y: 0
		}
	}
}

let getCview = () => {
	let obj
	
	if (F.activeView == 'oscilloscope') obj = C.oscilloscope
	else if (F.activeView == 'fft') obj = C.fft
	else if (F.activeView == 'timefreq') obj = C.timefreq
	else if (F.activeView == 'combined') obj = C.combined
	// Not checking for 'About' view
	
	return obj
}
let toggle = (keycode) => {
	let obj = getCview()
	if (!obj) return false
	
	// 'A' key
	if (keycode == 65) {
		// Toggle global control variable
		obj.axisToggle = !obj.axisToggle
	}
	// 'G' key
	if (keycode == 71) {
		// Toggle global control variable
		obj.gridToggle = !obj.gridToggle
	}
	// 'P' key
	if (keycode == 80) {
		// Toggle global control variable
		obj.precisionToggle = !obj.precisionToggle
	}
	// Arrow keys
	if (keycode == 37) {// Left arrow
		obj.scale.x--
	} else if (keycode == 38) {// Up arrow
		obj.scale.y++
	} else if (keycode == 39) {// Right arrow
		obj.scale.x++
	} else if (keycode == 40) {// Down arrow
		obj.scale.y--
	}
	obj.scale.x = Math.min(2, Math.max(0, obj.scale.x))
	obj.scale.y = Math.min(2, Math.max(0, obj.scale.y))
}

// Used for A, G and P keys
let updateControlsView = () => {
	let obj = getCview()
	if (!obj) return false
	
	// Remove all .active classes
	Array.from(obj.controlsNode.querySelectorAll('.control-tab')).forEach((el) => {
		el.classList.remove('active')
	})
	
	// Add .active on all active tabs
	Array.from(obj.controlsNode.querySelectorAll('.key-icon')).forEach((el) => {
		let keycode = el.getAttribute('data-keycode')
		if (
			obj.axisToggle && keycode == 65 ||
			obj.gridToggle && keycode == 71 ||
			obj.precisionToggle && keycode == 80
		) {
			el.parentNode.classList.add('active')
		}
	})
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	// Key control
	document.addEventListener("keyup", (event) => {
		toggle(event.keyCode)
		updateControlsView()
	})
	
	// Click/tap control
	Array.from(document.getElementsByClassName('key-icon')).forEach((el) => {
		el.addEventListener('click', (ev) => {
			let keycode = ev.target.getAttribute('data-keycode')
			toggle(keycode)
			updateControlsView()
		})
	})
	
	// Special case for arrows because they don't remain pressed (more than 2 states)
	document.addEventListener("keydown", (event) => {
		if (event.keyCode == 37) {
			document.querySelector(".arrows-control-tab .key-info").classList.add('active')
			document.querySelector(".key-icon[data-keycode='37']").classList.add('active')
		} else if (event.keyCode == 38) {
			document.querySelector(".arrows-control-tab .key-info").classList.add('active')
			document.querySelector(".key-icon[data-keycode='38']").classList.add('active')
		} else if (event.keyCode == 39) {
			document.querySelector(".arrows-control-tab .key-info").classList.add('active')
			document.querySelector(".key-icon[data-keycode='39']").classList.add('active')
		} else if (event.keyCode == 40) {
			document.querySelector(".arrows-control-tab .key-info").classList.add('active')
			document.querySelector(".key-icon[data-keycode='40']").classList.add('active')
		}
	})
	document.addEventListener("keyup", (event) => {
		if (event.keyCode == 37) {
			document.querySelector(".arrows-control-tab .key-info").classList.remove('active')
			document.querySelector(".key-icon[data-keycode='37']").classList.remove('active')
		} else if (event.keyCode == 38) {
			document.querySelector(".arrows-control-tab .key-info").classList.remove('active')
			document.querySelector(".key-icon[data-keycode='38']").classList.remove('active')
		} else if (event.keyCode == 39) {
			document.querySelector(".arrows-control-tab .key-info").classList.remove('active')
			document.querySelector(".key-icon[data-keycode='39']").classList.remove('active')
		} else if (event.keyCode == 40) {
			document.querySelector(".arrows-control-tab .key-info").classList.remove('active')
			document.querySelector(".key-icon[data-keycode='40']").classList.remove('active')
		}
	})
})
