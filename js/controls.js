/**
 * Controls script file for FOPTI project
 *
 * @author Alex Andrix
 * @date 2022
 */

let C = {
	axisToggle: false,
	gridToggle: false,
	precisionToggle: false,
	scale: {
		x: 0,// 0, 1 or 2
		y: 0// 0, 1 or 2
	}
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
	// Arrow keys
	if (keycode == 37) {// Left arrow
		C.scale.x--
	} else if (keycode == 38) {// Up arrow
		C.scale.y++
	} else if (keycode == 39) {// Right arrow
		C.scale.x++
	} else if (keycode == 40) {// Down arrow
		C.scale.y--
	}
	C.scale.x = Math.min(2, Math.max(0, C.scale.x))
	C.scale.y = Math.min(2, Math.max(0, C.scale.y))
}

// Used for A, G and P keys
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
