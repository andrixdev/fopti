/**
 * Controls script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

let C = {
	axisToggle: false,
	gridToggle: false,
	precisionToggle: false
}

let toggle = (keycode) => {
	// 'A' key
	if (keycode == 65) {
		// Toggle global control variable
		C.axisToggle = !C.axisToggle
	}
	
	// 'G' key
	if (keycode == 71) {
		// Toggle global control variable
		C.gridToggle = !C.gridToggle
	}
	
	// 'P' key
	if (keycode == 80) {
		// Toggle global control variable
		C.precisionToggle = !C.precisionToggle
	}
}
let updateControlsView = () => {
	// Remove all .active classes
	Array.from(document.getElementsByClassName('control-tab')).forEach((el) => {
		el.classList.remove('active')
	})
	
	// Add .active on all active tabs
	Array.from(document.getElementsByClassName('key-icon')).forEach((el) => {
		let keycode = el.getAttribute('data-keycode')
		if (
			C.axisToggle && keycode == 65 ||
			C.gridToggle && keycode == 71 ||
			C.precisionToggle && keycode == 80
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
})
