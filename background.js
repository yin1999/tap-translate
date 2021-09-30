importScripts('translateAPI.js')

const translateAPI = {
	ali: aliTranslate,
	google: googleTranslate
}

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get("state", result => {
		setState(result.state ?? true)
	})
})

chrome.action.onClicked.addListener(() => {
	chrome.storage.local.get("state", result => {
		setState(!result.state)
	})
})

function setState(state) {
	chrome.storage.local.set({ state })
	chrome.action.setIcon({ path: state ? "translate-on.png" : "translate-off.png" })
	chrome.action.setTitle({ title: "Status: " + (state ? "ON" : "OFF") })
}

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
