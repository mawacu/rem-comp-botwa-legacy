const fs = require('fs');

const listSessionFile = fs.readdirSync('./SESSION');
let array2 = []
let array3 = []
let array4 = []
let array5 = []

// separate to 4 array
for (let i = 0; i < listSessionFile.length; i++) {
    if (i % 4 === 0) {
        array2.push(listSessionFile[i])
    } else if (i % 4 === 1) {
        array3.push(listSessionFile[i])
    } else if (i % 4 === 2) {
        array4.push(listSessionFile[i])
    } else if (i % 4 === 3) {
        array5.push(listSessionFile[i])
    }
}

// { id: id, virtualBotId: id, isStop: false, retryCount: 0, isMobile: false, dbVer: '1.0' }
fs.writeFileSync(`/home/dwi/Mizu2/lib/database/jadibot/jadibot2.json`, JSON.stringify(array2.map((id) => { return { id: '', virtualBotId: id, isStop: false, retryCount: 0, isMobile: false, dbVer: '1.0' } }, null, 2)))
fs.writeFileSync(`/home/dwi/Mizu2/lib/database/jadibot/jadibot3.json`, JSON.stringify(array3.map((id) => { return { id: '', virtualBotId: id, isStop: false, retryCount: 0, isMobile: false, dbVer: '1.0' } }, null, 2)))
fs.writeFileSync(`/home/dwi/Mizu2/lib/database/jadibot/jadibot4.json`, JSON.stringify(array4.map((id) => { return { id: '', virtualBotId: id, isStop: false, retryCount: 0, isMobile: false, dbVer: '1.0' } }, null, 2)))
fs.writeFileSync(`/home/dwi/Mizu2/lib/database/jadibot/jadibot5.json`, JSON.stringify(array5.map((id) => { return { id: '', virtualBotId: id, isStop: false, retryCount: 0, isMobile: false, dbVer: '1.0' } }, null, 2)))