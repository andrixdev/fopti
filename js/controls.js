/**
 * Controls script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

let C = {
	axisToggle: false
}

document.addEventListener("DOMContentLoaded", (ev) => {
	document.addEventListener("keyup", (event) => {
		if (event.keyCode == 65) {
			// Toggle global control variable
			C.axisToggle = !C.axisToggle
			
			// Apply to all instances of UI controls
			Array.from(document.getElementsByClassName('key-icon')).forEach((el) => {
				log(el)
				
			})
		}
	})
})
