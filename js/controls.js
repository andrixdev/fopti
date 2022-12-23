/**
 * Controls script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

let C = {
	axisToggle: false,
	gridToggle: false,
	loglogToggle: false
}

document.addEventListener("DOMContentLoaded", (ev) => {
	
	document.addEventListener("keyup", (event) => {
		
		let toggledVariable
		
		// 'A' key
		if (event.keyCode == 65) {
			// Toggle global control variable
			C.axisToggle = !C.axisToggle
			toggledVariable = C.axisToggle
		}
		
		// 'G' key
		if (event.keyCode == 71) {
			// Toggle global control variable
			C.gridToggle = !C.gridToggle
			toggledVariable = C.gridToggle
		}
		
		// 'L' key
		if (event.keyCode == 76) {
			// Toggle global control variable
			C.loglogToggle = !C.loglogToggle
			toggledVariable = C.loglogToggle
		}
		
		// Apply to all instances of UI controls
		Array.from(document.getElementsByClassName('key-icon')).forEach((el) => {
			if (el.getAttribute('data-keycode') == event.keyCode) {
				el.parentNode.classList.remove('active')
				if (toggledVariable) el.parentNode.classList.add('active')
			}
		})
		
	})
	
})
