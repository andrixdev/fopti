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
		},
		arrows: {
			leftPressed: false,
			upPressed: false,
			rightPressed: false,
			downPressed: false
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
		},
		arrows: {
			leftPressed: false,
			rightPressed: false
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
		},
		arrows: {
			upPressed: false,
			downPressed: false
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
		},
		arrows: {
			upPressed: false,
			downPressed: false
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
let updateCmodel = (keycode, type) => {
	// type can be either 'keyup' or 'keydown'
	
	let obj = getCview()
	if (!obj) return false
	
	// 'A' key
	if (keycode == 65 && type == 'keyup') {
		obj.axisToggle = !obj.axisToggle
	}
	// 'G' key
	if (keycode == 71 && type == 'keyup') {
		obj.gridToggle = !obj.gridToggle
	}
	// 'P' key
	if (keycode == 80 && type == 'keyup') {
		// Toggle global control variable
		obj.precisionToggle = !obj.precisionToggle
	}
	// Arrow keys
	if (keycode == 37 && type == 'keyup') {// Left arrow
		obj.scale.x--
	} else if (keycode == 38 && type == 'keyup') {// Up arrow
		obj.scale.y++
	} else if (keycode == 39 && type == 'keyup') {// Right arrow
		obj.scale.x++
	} else if (keycode == 40 && type == 'keyup') {// Down arrow
		obj.scale.y--
	}
	obj.scale.x = Math.min(2, Math.max(0, obj.scale.x))
	obj.scale.y = Math.min(2, Math.max(0, obj.scale.y))
	
	// Arrow pressed states
	if (keycode == 37 && !!type && obj.arrows.leftPressed != null) { obj.arrows.leftPressed = type == 'keydown' ? true : false }
	if (keycode == 38 && !!type && obj.arrows.upPressed != null) { obj.arrows.upPressed = type == 'keydown' ? true : false }
	if (keycode == 39 && !!type && obj.arrows.rightPressed != null) { obj.arrows.rightPressed = type == 'keydown' ? true : false }
	if (keycode == 40 && !!type && obj.arrows.downPressed != null) { obj.arrows.downPressed = type == 'keydown' ? true : false }
}
let updateCview = () => {
	let obj = getCview()
	if (!obj) return false
	
	// Remove all .active classes
	Array.from(obj.controlsNode.querySelectorAll('.control-tab')).forEach((el) => {
		el.classList.remove('active')
		// For arrows (.active class is on the key icon and not on the controls tab)
		Array.from(obj.controlsNode.querySelectorAll('.key-icon')).forEach((elt) => {
			elt.classList.remove('active')
		})
		obj.controlsNode.querySelector('.key-info').classList.remove('active')
	})
	
	// Add .active on all active control tabs or subdivs (.key-icon and .key-info)
	Array.from(obj.controlsNode.querySelectorAll('.key-icon')).forEach((el) => {
		let keycode = el.getAttribute('data-keycode')
		
		// 'A', 'G' and 'P'
		if (
			obj.axisToggle && keycode == 65 ||
			obj.gridToggle && keycode == 71 ||
			obj.precisionToggle && keycode == 80
		) {
			el.parentNode.classList.add('active')
		}
		
		// Arrows
		if (obj.arrows.leftPressed && keycode == 37) {
			el.classList.add('active')
			el.parentNode.querySelector(".key-info").classList.add('active')
		}
		if (obj.arrows.upPressed && keycode == 38) {
			el.classList.add('active')
			el.parentNode.querySelector(".key-info").classList.add('active')
		}
		if (obj.arrows.rightPressed && keycode == 39) {
			el.classList.add('active')
			el.parentNode.querySelector(".key-info").classList.add('active')
			
		}
		if (obj.arrows.downPressed && keycode == 40) {
			el.classList.add('active')
			el.parentNode.querySelector(".key-info").classList.add('active')
		}
	})
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	// Click/tap control
	Array.from(document.getElementsByClassName('key-icon')).forEach((el) => {
		el.addEventListener('click', (ev) => {
			let keycode = ev.target.getAttribute('data-keycode')
			updateCmodel(keycode, 'keyup')
			updateCview()
		})
	})
	
	// Key control
	document.addEventListener("keydown", (event) => {
		updateCmodel(event.keyCode, 'keydown')
		updateCview()
	})
	document.addEventListener("keyup", (event) => {
		updateCmodel(event.keyCode, 'keyup')
		updateCview()
	})
})
