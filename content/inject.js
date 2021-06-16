const bubbleDOM = document.createElement('div')
const innerContent = document.createElement('p')
innerContent.setAttribute('class', 'popover__message')
bubbleDOM.appendChild(innerContent)
bubbleDOM.setAttribute('class', 'popover__content')
document.body.appendChild(bubbleDOM)

let changed = false

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', e => {
	if (!changed) {
		return
	}
	changed = false
	const selection = document.getSelection()
	const selectedText = selection.toString().trim()
	if (selectedText.length > 0) {
		const rect = selection.getRangeAt(0).getBoundingClientRect()
		triggered = true
		chrome.runtime.sendMessage(selectedText, response => {
			switch (response.status) {
				case "ok":
					renderBubble(rect.left, rect.bottom, response.translatedText)
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

document.addEventListener('selectionchange', e => {
	changed = true
})

// Close the bubble when we click on the screen.
document.addEventListener('mousedown', () => {
	bubbleDOM.style.visibility = 'hidden';
})

// Move that bubble to the appropriate location.
function renderBubble(x, y, selection) {
	innerContent.innerText = selection;
	bubbleDOM.style.top = y + 'px';
	bubbleDOM.style.left = x + 'px';
	bubbleDOM.style.visibility = 'visible';
}
