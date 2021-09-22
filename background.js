importScripts('translateAPI.js')

const engineList = ['ali', 'google']
const translateAPI = {
	ali: aliTranslate,
	google: googleTranslate
}

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get("state", result => {
		const state = result.state !== undefined ? result.state : true
		setState(state)
	})
})

chrome.action.onClicked.addListener(() => {
	chrome.storage.local.get("state", result => {
		setState(!result.state)
	})
})

function setState(newstate) {
	chrome.storage.local.set({ state: newstate })
	chrome.action.setIcon({ path: newstate ? "translate-on.png" : "translate-off.png" })
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
	chrome.storage.local.get("state", result => {
		if (result.state === false) {
			sendResponse({
				status: "noOp"
			})
			return
		}
		chrome.storage.sync.get(["default"], async result => {
			if (!result.default) {
				sendResponse({
					status: "请在'扩展程序选项'中完善设置"
				})
				return
			}
			translateAPI[result.default.name](message, result.default)
				.then(res => {
					sendResponse(res)
				})
		})
	})
	return true // async
})
