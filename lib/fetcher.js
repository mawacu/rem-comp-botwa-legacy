const fs = require('fs')
const filetype = require('file-type')
const path = require('path')

const getBase64 = async (url) => {
    const response = await fetch(url, { headers: { 'User-Agent': 'okhttp/4.5.0' } });
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const buffer = await response.buffer();
    const videoBase64 = `data:${response.headers.get('content-type')};base64,` + buffer.toString('base64');
    if (buffer)
        return videoBase64;
};

const uploadImages = (buffData) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const ext = await filetype.fromBuffer(buffData)
        const filePath = `./media/${Date.now()}.${ext.ext}`
        fs.writeFile(filePath, buffData, {}, async (err) => {
            if (err) return reject(err)
            console.log('Uploading image to catbox.moe server...')
            const fileData = await fs.openAsBlob(filePath)
            const form = new FormData()
            form.set('reqtype', 'fileupload')
            form.set('fileToUpload', fileData, path.basename(filePath))
            fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            })
                .then(res => res.text())
                .then(res => {
                    resolve(res)
                })
                .then(() => fs.unlinkSync(filePath))
                .catch(err => reject(err))
        })
    })
}

const fetchBase64 = (url, mimetype) => {
    return new Promise((resolve, reject) => {
        console.log('Get base64 from:', url)
        return fetch(url)
            .then((res) => {
                const _mimetype = mimetype || res.headers.get('content-type')
                res.buffer()
                    .then((result) => resolve(`data:${_mimetype};base64,` + result.toString('base64')))
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
    })
}

const custom = async (imageUrl, top, bott = '') => new Promise((resolve, reject) => {
	topText = top.replace(/ /g, '%20').replace('\n','%5Cn')
    fetch(`https://api.memegen.link/images/custom/${topText}/${bott}.png?background=${imageUrl}`)
        .then((result) => resolve(result.buffer()))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

const fetchJson = (url, options) => {
    return new Promise((resolve, reject) => {
        return fetch(url, options)
            .then((response) => response.json())
            .then((json) => resolve(json))
            .catch((err) => reject(err))
    })
}

exports.uploadImages = uploadImages;
exports.fetchBase64 = fetchBase64
exports.custom = custom;
exports.getBase64 = getBase64;
exports.fetchJson = fetchJson