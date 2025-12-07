'use strict';

const fs = require('fs')
const express = require('express')
const app = express();
const router = express.Router()
const cnfg = require('./config')
const bodyParser = require('body-parser');
const { chromium, firefox } = require('playwright-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const useProxy = require('puppeteer-page-proxy');
chromium.use(StealthPlugin())

const main = async () => {
    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true, timeout: 0, env: {
        LD_PRELOAD: '',
        LD_LIBRARY_PATH: ''
    } })
    global.browserPup = browser
    app.use(bodyParser.json({ limit: '100mb' })); 
    app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

    router.get('/', async (req, res) => {
        return res.send({ error: false, status: 'online' })
    })

    router.post('/req', async (req, res) => {
        if(req.body.content == undefined) return res.status(400).send({ error: true, result: undefined, message: 'No Script!' })
        try {
            const resultPuppeteerScript = await eval(req.body.content)
            return res.send(JSON.stringify({ error: false, result: resultPuppeteerScript }))
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: true, result: undefined, message: err })
        }
    })

    router.post('/html2img', async (req, res) => {
        if(req.body.content == undefined) return res.status(400).send({ error: true, result: undefined, message: 'No Html!' })
        if(req.body.viewport == undefined) return res.status(400).send({ error: true, result: undefined, message: 'No Viewport!' })
        const htmlContent = req.body.content
        const page = await browser.newPage()
        try {
            await page.setContent(htmlContent, { waitUntil: 'networkidle', timeout: 10000 })
            const elementSs = req.body.element ? await page.locator(req.body.element) : page
            const viewport = req.body.viewport ? JSON.parse(req.body.viewport) : { width: 1920, height: 1080 }
            const screenshot = await elementSs.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: viewport.width, height: viewport.height }})
            await page.close()
            return res.send({ error: false, result: screenshot.toString('base64') })
        } catch (err) {
            console.error(err)
            await page.close()
            return res.status(400).send({ error: true, result: undefined, message: err })
        }
    })

    app.use('/', router);
    app.set('port', (cnfg.pupport))
    app.listen(app.get('port'), () => {
        console.log('App Started on PORT', app.get('port'));
    })
}

function GenerateRandomNumber(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Generates a random alphanumberic character
function GenerateRandomChar() {
    var chars = "1234567890ABCDEFGIJKLMNOPQRSTUVWXYZ";
    var randomNumber = GenerateRandomNumber(0,chars.length - 1);
    return chars[randomNumber];
}
function GenerateSerialNumber(mask){
    var serialNumber = "";
    if(mask != null){
        for(var i=0; i < mask.length; i++){
            var maskChar = mask[i];
            serialNumber += maskChar == "0" ? GenerateRandomChar() : maskChar;
        }
    }
    return serialNumber;
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main()