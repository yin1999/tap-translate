chrome.storage.sync.get(['token', 'default'], result => {
	if (result.token) {
		const token = result.token
		for (const key in token) {
			document.querySelector(`fieldset[name=${key}]`)
			const value = token[key]
			for (const k in value) {
				document.getElementsByName(k)[0].value = value[k]
			}
		}
	}
	if (result.default) {
		document.getElementById(`${result.default.name}-engine`).checked = true
	}
})

document.getElementById('save').addEventListener('click', () => {
	const data = {}
	data.token = {}
	const fieldsets = document.getElementsByTagName('fieldset')
	for (const field of fieldsets) {
		if (field.name === 'select') {
			continue
		}
		const apiKey = {}
		const inputs = field.getElementsByTagName('input')
		for (const input of inputs) {
			if (input.value) {
				apiKey[input.name] = input.value
			}
		}
		const objectLength = Object.keys(apiKey).length
		if (objectLength === inputs.length) {
			data.token[field.name] = apiKey
		} else if (objectLength !== 0) {
			alert(`${field.getElementsByTagName('legend')[0].innerText}未设置完整（不使用则清空所有字段）`)
			return
		}
	}
	const defaultEngine = document.querySelector('[name=engine-select]:checked').id.slice(0, -7)
	if (data.token[defaultEngine]) {
		data.default = { ...data.token[defaultEngine] }
		data.default.name = defaultEngine
	} else if (Object.keys(data.token).length === 0) {
		data.default = null
	} else {
		alert(`${document.querySelector(`fieldset[name=${defaultEngine}]`).querySelector('legend').innerText}未设置`)
		return
	}
	chrome.storage.sync.set(data)
})
