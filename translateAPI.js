/**
 * 
 * @param {String} SourceText 
 * @param {Object} token 
 * @param {String} SourceLanguage 
 * @returns 
 */
async function aliTranslate(SourceText, token, SourceLanguage = undefined) {
	if (!token || !token.ak || !token.sk) {
		return {
			status: 'access key or secret key has not set'
		}
	}
	// detect language
	if (!SourceLanguage) {
		const body = {
			SourceText
		}
		try {
			const res = await aliOpenAPIRequest('GetDetectLanguage', body, token.ak, token.sk)
			SourceLanguage = res.DetectedLanguage
		} catch (err) {
			return {
				status: err
			}
		}
	}
	const body = {
		FormatType: 'text',
		SourceLanguage,
		SourceText,
		TargetLanguage: 'zh',
	}
	try {
		const res = await aliOpenAPIRequest('TranslateGeneral', body, token.ak, token.sk)
		return {
			translatedText: res.Data.Translated,
			SourceLanguage,
			status: "ok"
		}
	} catch (err) {
		console.error(err)
		return {
			status: err.toString()
		}
	}
}

/**
 * 
 * @param {String} SourceText 
 * @param {Object} token 
 * @param {String} SourceLanguage 
 * @returns 
 */
async function googleTranslate(SourceText, token, SourceLanguage = undefined) {
	if (!token.key) {
		return {
			status: 'key has not set'
		}
	}
	const requestUrl = 'https://translation.googleapis.com/language/translate/v2'
	const body = {
		q: SourceText,
		target: "zh",
		format: "text"
	}
	if (SourceLanguage) {
		body.source = SourceLanguage
	}
	const headers = {
		"Content-Type": "application/json; charset=utf-8"
	}
	const url = new URL(requestUrl)

	url.searchParams.append("key", token.key)
	try {
		let res = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers
		})
		res = await res.json()
		return {
			translatedText: res.data.translations[0].translatedText,
			SourceLanguage: SourceLanguage || res.data.translations[0].detectedSourceLanguage,
			status: "ok"
		}
	} catch (err) {
		console.error(err)
		return {
			status: err.toString()
		}
	}
}

async function aliOpenAPIRequest(action, body, accessKey, secretKey) {
	const requestUrl = 'https://mt.aliyuncs.com/'
	body.AccessKeyId = accessKey
	body.Action = action
	body.Format = 'JSON'
	body.SignatureMethod = 'HMAC-SHA1'
	body.SignatureVersion = '1.0'
	body.Timestamp = new Date().toISOString()
	body.Version = '2018-10-12'
	const randomArray = crypto.getRandomValues(new Uint8Array(4))
	body.SignatureNonce = btoa(randomArray)
	const params = new URLSearchParams(body)
	params.sort()
	let encodedBody = params.toString()
	const stringToSign = 'POST&%2F&' + encodeURIComponent(encodedBody)
	const signature = await HmacSha1Digest(secretKey, stringToSign)
	encodedBody += "&Signature=" + encodeURIComponent(signature)
	const headers = {
		"Content-Type": "application/x-www-form-urlencoded"
	}
	const resp = await fetch(requestUrl, {
		method: "POST",
		body: encodedBody,
		headers
	})
	return await resp.json()
}

/**
 * 
 * @param {String} secretKey 
 * @param {String} stringToSign 
 * @returns 
 */
async function HmacSha1Digest(secretKey, stringToSign) {
	const enc = new TextEncoder()
	let key = await crypto.subtle.importKey('raw', enc.encode(secretKey + "&"), {
		name: 'HMAC',
		hash: 'SHA-1'
	}, false, ['sign'])
	let signature = await crypto.subtle.sign('HMAC', key, enc.encode(stringToSign))
	signature = String.fromCharCode(...new Uint8Array(signature))
	return btoa(signature)
}
