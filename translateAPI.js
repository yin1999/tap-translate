importScripts('CryptoJS/components/core-min.js')
importScripts('CryptoJS/components/enc-base64-min.js')
importScripts('CryptoJS/rollups/hmac-sha1.js')

/**
 * 
 * @param {String} text 
 * @param {Object} token 
 * @param {String | null} sourceLanguage 
 * @returns 
 */
async function aliTranslate(text, token, sourceLanguage) {
    if (!token.ak || !token.sk) {
        return {
            status: 'access key or secret key has not set'
        }
    }
    // detect language
    if (!sourceLanguage) {
        const body = {
            "SourceText": text
        }
        try {
            const res = await aliOpenAPIRequest('GetDetectLanguage', body, token.ak, token.sk)
            sourceLanguage = res.DetectedLanguage
        } catch(err) {
            return {
                status: err
            }
        }
    }
    const body = {
        FormatType: 'text',
        SourceLanguage: sourceLanguage,
        SourceText: text,
        TargetLanguage: 'zh',
    }
    return aliOpenAPIRequest('TranslateGeneral', body, token.ak, token.sk)
        .then(res => {
            return {
                translatedText: res.Data.Translated,
                sourceLanguage: sourceLanguage,
                status: "ok"
            }
        })
        .catch(err => {
            console.log(err)
            return {
                status: err
            }
        })
}

/**
 * 
 * @param {String} text 
 * @param {Object} token 
 * @param {String | null} sourceLanguage 
 * @returns 
 */
async function googleTranslate(text, token, sourceLanguage) {
    if (!token.key) {
        return {
            status: 'key has not set'
        }
    }
    const requestUrl = 'https://translation.googleapis.com/language/translate/v2'
    const body = {
        q: text,
        target: "zh",
        format: "text"
    }
    if (sourceLanguage) {
        body.source = source
    }
    const header = {
        "Content-Type": "application/json; charset=utf-8"
    }
    const url = new URL(requestUrl)

    url.searchParams.append("key", token.key)
    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: header
        })
        const res_1 = await res.json()
        return {
            translatedText: res_1.data.translations[0].translatedText,
            sourceLanguage: res_1.data.translations[0].detectedSourceLanguage,
            status: "ok"
        }
    } catch (err) {
        console.error(err)
        return {
            status: err
        }
    }
}

async function aliOpenAPIRequest(action, body, accessKey, secretKey) {
    const requestUrl = 'https://mt.aliyuncs.com/'
    body.AccessKeyId = accessKey
    body.Action = action
    body.Format = 'JSON'
    body.SignatureNonce = Math.random().toString(36).slice(-31)
    body.SignatureMethod = 'HMAC-SHA1'
    body.SignatureVersion = '1.0'
    body.Timestamp = new Date().toISOString()
    body.Version = '2018-10-12'
    const keys = Object.keys(body).sort()
    const params = []
    for (const key of keys) {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(body[key]))
    }
    let encodedBody = params.join('&')
    let stringToSign = 'POST&%2F&' + encodeURIComponent(encodedBody)
    const header = new Headers({
        "Content-Type": "application/x-www-form-urlencoded"
    })
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(
        stringToSign,
        CryptoJS.enc.Utf8.parse(secretKey + "&")
    ))
    encodedBody += "&Signature=" + encodeURIComponent(signature)
    return fetch(requestUrl, {
        method: "POST",
        body: encodedBody,
        headers: header
    })
        .then(res => res.json())
}
