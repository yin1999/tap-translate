const bubbleDOM = document.createElement('div')
const innerContent = document.createElement('p')
innerContent.setAttribute('class', 'popover__message')
bubbleDOM.appendChild(innerContent)
bubbleDOM.setAttribute('class', 'popover__content')

// Listen to mouseup DOM events.
document.addEventListener('mouseup', e => {
	const selection = document.getSelection()
	const selectedText = selection.toString().trim()
	if (selectedText.length > 0) {
		const rect = selection.getRangeAt(0).getBoundingClientRect()
		chrome.runtime.sendMessage(selectedText, response => {
			switch (response.status) {
				case "ok":
					renderBubble(rect.left + window.pageXOffset, rect.bottom + window.pageYOffset, response.translatedText)
					break
				case "noOp":
					break
				default:
					alert(response.status)
					break
			}
		})
	}
})

// Remove the bubble when we click on the screen.
function removeBubble() {
	document.removeEventListener('mousedown', removeBubble)
	document.body.removeChild(bubbleDOM)
}

// Show the bubble to the appropriate location.
function renderBubble(x, y, selection) {
	document.body.appendChild(bubbleDOM)
	document.addEventListener('mousedown', removeBubble)
	innerContent.innerText = selection
	bubbleDOM.style.top = y + 'px'
	bubbleDOM.style.left = x + 'px'
	bubbleDOM.style.visibility = 'visible'
}
