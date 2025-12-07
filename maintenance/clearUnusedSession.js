const fs = require('fs')

const pathSession = '../SESSION'
const pathDbSession = '../lib/database/jadibot'
const listSession = fs.readdirSync(pathDbSession).filter(item => !item.includes('jadibotSettings.json'))

const allSessionId = []
for(let i = 0; i < listSession.length; i++) {
    const sessionJadibot = JSON.parse(fs.readFileSync(pathDbSession + '/' + listSession[i]))
    allSessionId.push(...sessionJadibot.map(item => item.virtualBotId))
}

const listSessionFolder = fs.readdirSync(pathSession)
for(let i = 0; i < listSession.length; i++) {
    if(allSessionId.includes(listSessionFolder[i]) || !listSessionFolder[i]) continue
    fs.rmSync(pathSession + '/' + listSessionFolder[i], { recursive: true, force: true })
}

console.log('Done')