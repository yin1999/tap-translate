importScripts('translateAPI.js')

const engineList = ['ali', 'google']
const translateAPI = {
	ali: aliTranslate,
	google: googleTranslate
}

let token = {}
let engine = 'ali'
let state = true

chrome.storage.sync.onChanged.addListener((changes, areaName) => {
	console.log(changes)
	if (changes.token != null) {
		if (changes.token.newValue != null) { // set new value
			token = changes.token.newValue
		} else {
			token = {}
		}
	}
	if (changes.engine != null) {
		if (changes.engine.newValue != null) {
			engine = changes.engine.newValue
		} else {
			engine = 'ali'
		}
	}
})

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.sync.get(["token", "engine"], result => {
		if (result.token) {
			token = result.token
		}
		if (result.engine) {
			engine = result.engine
		}
	})
	chrome.storage.local.get("state", result => {
		if (result.state !== undefined) {
			state = result.state
		}
		setState(state)
	})
})

chrome.action.onClicked.addListener(() => {
	state = !state
	setState(state)
})

function setState(newstate) {
	chrome.storage.local.set({ state: newstate })
	chrome.action.setTitle({ title: "Status: " + (newstate ? "ON" : "OFF") })
}

// // for shortcut
// chrome.commands.onCommand.addListener(() => {
// 	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
// 		if (tabs.length == 0) {
// 			return
// 		}
// 		chrome.scripting.executeScript({
// 			target: {
// 				tabId: tabs[0].id
// 			},
// 			function: () => window.getSelection().toString()
// 		}, result => {
// 			const text = result[0].result

// 		})
// 	})
// })

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	translate(message, sender, sendResponse)
	return true // async
})

async function translate(message, sender, sendResponse) {
	if (!state) {
		sendResponse({
			status: "noOp"
		})
		return
	}
	await translateAPI[engine](message, token[engine])
		.then(res => {
			sendResponse(res)
		})
}
