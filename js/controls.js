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
		
		// 'P' key
		if (event.keyCode == 80) {
			// Toggle global control variable
			C.precisionToggle = !C.precisionToggle
			toggledVariable = C.precisionToggle
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
