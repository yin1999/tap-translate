chrome.storage.sync.get(['token', 'engine'], result => {
    if (result.token) {
        const token = result.token
        for (const key in token) {
            const value = token[key]
            if (typeof value === 'object') {
                for (const k in value) {
                    document.getElementById(`${key}-${k}`).value = value[k]
                }
            } else {
                document.getElementById(`${key}`).value = value
            }
        }
    }
    if (result.engine) {
        document.getElementById(`${result.engine}-engine`).checked = true
    }
})

document.getElementById('save').addEventListener('click', () => {
    const idList = ['google-key', 'ali-ak', 'ali-sk']

    const data = {}
    data.token = {}
    for (const id of idList) {
        const l = id.split('-')
        switch (l.length) {
            case 1:
                data.token[id] = document.getElementById(id).value
                break
            case 2:
                if (!data.token[l[0]]) {
                    data.token[l[0]] = {}
                }
                data.token[l[0]][l[1]] = document.getElementById(id).value
                break
        }
    }
    data.engine = document.querySelector('[name=engine-select]:checked').id.slice(0, -7)
    console.log(data)
    chrome.storage.sync.set(data)
})
