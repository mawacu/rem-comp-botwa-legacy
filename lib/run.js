const pm2 = require('pm2')
const cron = require('node-cron');
const moment = require('moment-timezone')
const fs = require('fs')

const { sizeFormatter } = require('human-readable')
const os = require('os')
const spawn = require("child_process").spawn;

const axios = require('axios')

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const canvasRenderService1 = new ChartJSNodeCanvas({ width: 1920, height: 1080 });

const { numberWithCommas2, GenerateSerialNumber, sleep } = require('./lib/functions');
const { _mongo_UserSchema, _mongo_BotSchema, _mongo_CommandSchema } = require('./lib/dbtype');

const mongoose = require('mongoose');
const cron = require('node-cron');
mongoose.pluralize(null);
mongoose.connect(process.env.MONGODB_PRODUCTION_URI)
mongoose.pluralize(null);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Behasil menghubungkan database mongo ✓!');
})

moment.tz.setDefault('Asia/Jakarta').locale('id')

pm2.connect(async (error) => {
    if (error) {
        console.error(error)
    }

    pm2.start({
        script: 'index.js',
        name: 'new',
        max_memory_restart: '3072M',
        node_args: '--max-old-space-size=10384',
        shutdown_with_message: true,
        kill_timeout: 10000,
    }, (error, apps) => {
        pm2.disconnect()
        if (error) {
            console.error(error)
        }
    })

    pm2.start({
        script: 'jadibot1.js',
        name: 'new-jadibot1',
        // instances : "max",
        max_memory_restart: '3072M',
        //restart_delay: 3000,
        node_args: '--max-old-space-size=10384',
        shutdown_with_message: true,
        kill_timeout: 10000,
        cron_restart: '*/30 * * * *',
    }, (error, apps) => {
        pm2.disconnect()
        if (error) {
            console.error(error)
        }
    })

    pm2.start({
        script: 'jadibot2.js',
        name: 'new-jadibot2',
        // instances : "max",
        max_memory_restart: '3072M',
        //restart_delay: 3000,
        node_args: '--max-old-space-size=10384',
        shutdown_with_message: true,
        kill_timeout: 10000,
        cron_restart: '*/30 * * * *',
    }, (error, apps) => {
        pm2.disconnect()
        if (error) {
            console.error(error)
        }
    })

    pm2.start({
        script: 'jadibot3.js',
        name: 'new-jadibot3',
        // instances : "max",
        max_memory_restart: '3072M',
        //restart_delay: 3000,
        node_args: '--max-old-space-size=10384',
        shutdown_with_message: true,
        kill_timeout: 10000,
        cron_restart: '*/30 * * * *',
    }, (error, apps) => {
        pm2.disconnect()
        if (error) {
            console.error(error)
        }
    })

    pm2.start({
        script: 'puppeteer.js',
        name: 'browser-puppeteer',
        // exec_mode : "cluster",
        max_memory_restart: '3096M',
        node_args: '--max-old-space-size=4196',
        shutdown_with_message: true,
        kill_timeout: 10000,
        cron_restart: '*/30 * * * *',
    }, (error, apps) => {
        pm2.disconnect()
        if (error) {
            console.error(error)
        }
    })

    cron.schedule('0 * * * *', async function () {
        const commandDb = await _mongo_CommandSchema.findOne({ cId: 'togel' })

        if(commandDb.content[0] != undefined) {
            const isWinner = commandDb.content.find((x) => x.number == commandDb.options.randomNumber)

            if(isWinner) {
                await _mongo_UserSchema.updateOne({ iId: isWinner.iId }, { $inc: { "economy.money": commandDb.options.money } })
                await _mongo_CommandSchema.updateOne({ cId: 'togel' }, { $set: { content: [], "options.money": 0, "options.randomNumber": Math.floor(Math.random() * 1000) }, $push: { "options.winner": { iId: isWinner.iId, number: isWinner.number, time: Date.now() } } } )
            } else {
                await _mongo_CommandSchema.updateOne({ cId: 'togel' }, { $set: { content: [], "options.randomNumber": Math.floor(Math.random() * 1000) } } )
            }
        }
    })

    cron.schedule("*/1 * * * *", async function () {    
        try {
            const _botDb = await  _mongo_BotSchema.findOne({ iId: 'CORE' })
            var _invest = _botDb.invest
            var _record_ram_cpu = _botDb.record
            const setRecord_stat = async () => {
                const obj = {
                    re0: null,
                    re1: null,
                    re2: null,
                    re3: null,
                    re4: null,
                    re5: null,
                    re6: null,
                    re7: null,
                    re8: null,
                    re9: null,
                    r0: null,
                    r1: null,
                    r2: null,
                    r3: null,
                    r4: null,
                    r5: null,
                    r6: null,
                    r7: null,
                    r8: null,
                    r9: null,
                    c0: null,
                    c1: null,
                    c2: null,
                    c3: null,
                    c4: null,
                    c5: null,
                    c6: null,
                    c7: null,
                    c8: null,
                    c9: null
                }
                await _mongo_BotSchema.updateOne({ iId: 'CORE' }, { record: obj })
            }
            const getRecord_stat = () => {
                return _record_ram_cpu?.re0
            }
            if (getRecord_stat() == undefined) await setRecord_stat()
        
            const format = sizeFormatter({
                std: 'JEDEC', // 'SI' (default) | 'IEC' | 'JEDEC'
                decimalPlaces: 2,
                keepTrailingZeroes: false,
                render: (literal, symbol) => `${literal} ${symbol}B`,
            })
        
            var cpuPercentage = ''
            const exec = require('child_process').exec
        
            await exec(`awk '{u=$2+$4; t=$2+$4+$5; if (NR==1){u1=u; t1=t;} else print ($2+$4-u1) * 100 / (t-t1) "%"; }' \
                <(grep 'cpu ' /proc/stat) <(sleep 1;grep 'cpu ' /proc/stat)`, {
                shell: "/bin/bash"
            }, (err, stdout, stderr) => {
                cpuPercentage = parseFloat(stdout.replace('%', ''))
                if (err) {
                    console.log(stderr)
                }
            })
            if (cpuPercentage == '') await sleep(2000)
        
            const randomNaikTurunInvest_iron = Math.floor(Math.random() * 2)
            const randomNaikTurunInvest_gold = Math.floor(Math.random() * 2)
            const randomNaikTurunInvest_NaoCoin = Math.floor(Math.random() * 2)
            const randomNaikTurunInvest_ElaCoin = Math.floor(Math.random() * 2)
            const randomNaikTurunInvest_ReCoin = Math.floor(Math.random() * 2)
            if (randomNaikTurunInvest_iron == 0) { //Naik
                if (Number(_invest[0].iron) >= 60000) { //Paksa Turun
                    var randomTurun_jumlah_iron = Math.abs(_invest[0].iron - Math.floor(Math.random() * 2000))
                    _invest[0].iron = randomTurun_jumlah_iron
                } else {
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_iron = Math.abs(_invest[0].iron + Math.floor(Math.random() * 2000))
                    _invest[0].iron = randomNaik_jumlah_iron
                }
            } else if (randomNaikTurunInvest_iron == 1) { // Turun
                if (Number(_invest[0].iron) <= 1000) { //Paksa Naik
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_iron = Math.abs(_invest[0].iron + Math.floor(Math.random() * 2000))
                    _invest[0].iron = randomNaik_jumlah_iron
                } else {
                    var randomTurun_jumlah_iron = Math.abs(_invest[0].iron - Math.floor(Math.random() * 2000))
                    _invest[0].iron = randomTurun_jumlah_iron
                }
            }
        
            if (randomNaikTurunInvest_gold == 0) { //Turun
                if (Number(_invest[0].gold) <= 75000) { //Paksa Naik
                    var randomNaik_jumlah_gold = Math.floor(_invest[0].gold + Math.floor(Math.random() * 5000))
                    _invest[0].gold = randomNaik_jumlah_gold
                } else {
                    var randomTurun_jumlah_gold = Math.abs(_invest[0].gold - Math.floor(Math.random() * 5000))
                    _invest[0].gold = randomTurun_jumlah_gold
                }
            } else if (randomNaikTurunInvest_gold == 1) {
                if (Number(_invest[0].gold) >= 250000) { //Paksa Turun
                    var randomTurun_jumlah_gold = Math.abs(_invest[0].gold - Math.floor(Math.random() * 5000))
                    _invest[0].gold = randomTurun_jumlah_gold
                } else {
                    var randomNaik_jumlah_gold = Math.floor(_invest[0].gold + Math.floor(Math.random() * 5000))
                    _invest[0].gold = randomNaik_jumlah_gold
                }
            }
        
            if (randomNaikTurunInvest_NaoCoin == 0) { //Naik
                if (Number(_invest[0].naocoin) >= 500000) { //Paksa Turun
                    var randomTurun_jumlah_naocoin = Math.abs(_invest[0].naocoin - Math.floor(Math.random() * 11000))
                    _invest[0].naocoin = randomTurun_jumlah_naocoin
                } else {
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_naocoin = Math.abs(_invest[0].naocoin + Math.floor(Math.random() * 11000))
                    _invest[0].naocoin = randomNaik_jumlah_naocoin
                }
            } else if (randomNaikTurunInvest_NaoCoin == 1) { // Turun
                if (Number(_invest[0].naocoin) <= 250000) { //Paksa Naik
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_naocoin = Math.abs(_invest[0].naocoin + Math.floor(Math.random() * 11000))
                    _invest[0].naocoin = randomNaik_jumlah_naocoin
                } else {
                    var randomTurun_jumlah_naocoin = Math.abs(_invest[0].naocoin - Math.floor(Math.random() * 11000))
                    _invest[0].naocoin = randomTurun_jumlah_naocoin
                }
            }
        
            if (randomNaikTurunInvest_ElaCoin == 0) { //TURUN
                if (Number(_invest[0].elacoin) <= 500000) { //Paksa Naik
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_elacoin = Math.abs(_invest[0].elacoin + Math.floor(Math.random() * 21000))
                    _invest[0].elacoin = randomNaik_jumlah_elacoin
                } else {
                    var randomTurun_jumlah_elacoin = Math.abs(_invest[0].elacoin - Math.floor(Math.random() * 21000))
                    _invest[0].elacoin = randomTurun_jumlah_elacoin
                }
            } else if (randomNaikTurunInvest_ElaCoin == 1) { // Naik
                if (Number(_invest[0].elacoin) >= 2500000) { //Paksa Turun
                    var randomTurun_jumlah_elacoin = Math.abs(_invest[0].elacoin - Math.floor(Math.random() * 21000))
                    _invest[0].elacoin = randomTurun_jumlah_elacoin
                } else {
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_elacoin = Math.abs(_invest[0].elacoin + Math.floor(Math.random() * 21000))
                    _invest[0].elacoin = randomNaik_jumlah_elacoin
                }
            }
        
            if (randomNaikTurunInvest_ReCoin == 0) { //Naik
                if (Number(_invest[0].recoin) >= 35000000) { //Paksa Turun
                    var randomTurun_jumlah_recoin = Math.abs(_invest[0].recoin - Math.floor(Math.random() * 40000))
                    _invest[0].recoin = randomTurun_jumlah_recoin
                } else {
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_recoin = Math.abs(_invest[0].recoin + Math.floor(Math.random() * 40000))
                    _invest[0].recoin = randomNaik_jumlah_recoin
                }
            } else if (randomNaikTurunInvest_ReCoin == 1) { // Turun
                if (Number(_invest[0].recoin) <= 4000000) { //Paksa Naik
                    //var randomNaik_jumlah_iron = Math.floor(_invest[0].iron + Math.abs(Math.floor(Math.random() * 30000) - _invest[0].iron - 10000))
                    var randomNaik_jumlah_recoin = Math.abs(_invest[0].recoin + Math.floor(Math.random() * 40000))
                    _invest[0].recoin = randomNaik_jumlah_recoin
                } else {
                    var randomTurun_jumlah_recoin = Math.abs(_invest[0].recoin - Math.floor(Math.random() * 40000))
                    _invest[0].recoin = randomTurun_jumlah_recoin
                }
            }
            _invest[1].re_iron0 = _invest[1].re_iron1
            _invest[1].re_iron1 = _invest[1].re_iron2
            _invest[1].re_iron2 = _invest[1].re_iron3
            _invest[1].re_iron3 = _invest[1].re_iron4
            _invest[1].re_iron4 = _invest[1].re_iron5
            _invest[1].re_iron5 = _invest[1].re_iron6
            _invest[1].re_iron6 = _invest[1].re_iron7
            _invest[1].re_iron7 = _invest[1].re_iron8
            _invest[1].re_iron8 = _invest[1].re_iron9
            _invest[1].re_iron9 = _invest[0].iron
            _invest[1].re_gold0 = _invest[1].re_gold1
            _invest[1].re_gold1 = _invest[1].re_gold2
            _invest[1].re_gold2 = _invest[1].re_gold3
            _invest[1].re_gold3 = _invest[1].re_gold4
            _invest[1].re_gold4 = _invest[1].re_gold5
            _invest[1].re_gold5 = _invest[1].re_gold6
            _invest[1].re_gold6 = _invest[1].re_gold7
            _invest[1].re_gold7 = _invest[1].re_gold8
            _invest[1].re_gold8 = _invest[1].re_gold9
            _invest[1].re_gold9 = _invest[0].gold
            _invest[1].re_naocoin0 = _invest[1].re_naocoin1
            _invest[1].re_naocoin1 = _invest[1].re_naocoin2
            _invest[1].re_naocoin2 = _invest[1].re_naocoin3
            _invest[1].re_naocoin3 = _invest[1].re_naocoin4
            _invest[1].re_naocoin4 = _invest[1].re_naocoin5
            _invest[1].re_naocoin5 = _invest[1].re_naocoin6
            _invest[1].re_naocoin6 = _invest[1].re_naocoin7
            _invest[1].re_naocoin7 = _invest[1].re_naocoin8
            _invest[1].re_naocoin8 = _invest[1].re_naocoin9
            _invest[1].re_naocoin9 = _invest[0].naocoin
            _invest[1].re_elacoin0 = _invest[1].re_elacoin1
            _invest[1].re_elacoin1 = _invest[1].re_elacoin2
            _invest[1].re_elacoin2 = _invest[1].re_elacoin3
            _invest[1].re_elacoin3 = _invest[1].re_elacoin4
            _invest[1].re_elacoin4 = _invest[1].re_elacoin5
            _invest[1].re_elacoin5 = _invest[1].re_elacoin6
            _invest[1].re_elacoin6 = _invest[1].re_elacoin7
            _invest[1].re_elacoin7 = _invest[1].re_elacoin8
            _invest[1].re_elacoin8 = _invest[1].re_elacoin9
            _invest[1].re_elacoin9 = _invest[0].elacoin
            _invest[1].re_recoin0 = _invest[1].re_recoin1
            _invest[1].re_recoin1 = _invest[1].re_recoin2
            _invest[1].re_recoin2 = _invest[1].re_recoin3
            _invest[1].re_recoin3 = _invest[1].re_recoin4
            _invest[1].re_recoin4 = _invest[1].re_recoin5
            _invest[1].re_recoin5 = _invest[1].re_recoin6
            _invest[1].re_recoin6 = _invest[1].re_recoin7
            _invest[1].re_recoin7 = _invest[1].re_recoin8
            _invest[1].re_recoin8 = _invest[1].re_recoin9
            _invest[1].re_recoin9 = _invest[0].recoin
            _record_ram_cpu.re0 = _record_ram_cpu.re1
            _record_ram_cpu.re1 = _record_ram_cpu.re2
            _record_ram_cpu.re2 = _record_ram_cpu.re3
            _record_ram_cpu.re3 = _record_ram_cpu.re4
            _record_ram_cpu.re4 = _record_ram_cpu.re5
            _record_ram_cpu.re5 = _record_ram_cpu.re6
            _record_ram_cpu.re6 = _record_ram_cpu.re7
            _record_ram_cpu.re7 = _record_ram_cpu.re8
            _record_ram_cpu.re8 = _record_ram_cpu.re9
            //_record_ram_cpu.re9 = Number(Number(speed_c) / 60 * 100).toFixed(3)
            _record_ram_cpu.r0 = _record_ram_cpu.r1
            _record_ram_cpu.r1 = _record_ram_cpu.r2
            _record_ram_cpu.r2 = _record_ram_cpu.r3
            _record_ram_cpu.r3 = _record_ram_cpu.r4
            _record_ram_cpu.r4 = _record_ram_cpu.r5
            _record_ram_cpu.r5 = _record_ram_cpu.r6
            _record_ram_cpu.r6 = _record_ram_cpu.r7
            _record_ram_cpu.r7 = _record_ram_cpu.r8
            _record_ram_cpu.r8 = _record_ram_cpu.r9
            _record_ram_cpu.r9 = Number(Number(100 * Number(format(os.totalmem() - os.freemem()).replace(' GB', '')).toFixed(3) / Number(format(os.totalmem()).replace(' GB', '')).toFixed(3)).toFixed(3))
            _record_ram_cpu.c0 = _record_ram_cpu.c1
            _record_ram_cpu.c1 = _record_ram_cpu.c2
            _record_ram_cpu.c2 = _record_ram_cpu.c3
            _record_ram_cpu.c3 = _record_ram_cpu.c4
            _record_ram_cpu.c4 = _record_ram_cpu.c5
            _record_ram_cpu.c5 = _record_ram_cpu.c6
            _record_ram_cpu.c6 = _record_ram_cpu.c7
            _record_ram_cpu.c7 = _record_ram_cpu.c8
            _record_ram_cpu.c8 = _record_ram_cpu.c9
            _record_ram_cpu.c9 = cpuPercentage
            await _mongo_BotSchema.updateOne({ iId: 'CORE' }, { $set: { record: _record_ram_cpu, invest: _invest } })
            console.log('Writing Ram/Cpu Record')
        
            const re0_gold = _invest[1].re_gold0
            const re1_gold = _invest[1].re_gold1
            const re2_gold = _invest[1].re_gold2
            const re3_gold = _invest[1].re_gold3
            const re4_gold = _invest[1].re_gold4
            const re5_gold = _invest[1].re_gold5
            const re6_gold = _invest[1].re_gold6
            const re7_gold = _invest[1].re_gold7
            const re8_gold = _invest[1].re_gold8
            const re9_gold = _invest[1].re_gold9
            const re0_iron = _invest[1].re_iron0
            const re1_iron = _invest[1].re_iron1
            const re2_iron = _invest[1].re_iron2
            const re3_iron = _invest[1].re_iron3
            const re4_iron = _invest[1].re_iron4
            const re5_iron = _invest[1].re_iron5
            const re6_iron = _invest[1].re_iron6
            const re7_iron = _invest[1].re_iron7
            const re8_iron = _invest[1].re_iron8
            const re9_iron = _invest[1].re_iron9
            const re0_naocoin = _invest[1].re_naocoin0
            const re1_naocoin = _invest[1].re_naocoin1
            const re2_naocoin = _invest[1].re_naocoin2
            const re3_naocoin = _invest[1].re_naocoin3
            const re4_naocoin = _invest[1].re_naocoin4
            const re5_naocoin = _invest[1].re_naocoin5
            const re6_naocoin = _invest[1].re_naocoin6
            const re7_naocoin = _invest[1].re_naocoin7
            const re8_naocoin = _invest[1].re_naocoin8
            const re9_naocoin = _invest[1].re_naocoin9
            const re0_elacoin = _invest[1].re_elacoin0
            const re1_elacoin = _invest[1].re_elacoin1
            const re2_elacoin = _invest[1].re_elacoin2
            const re3_elacoin = _invest[1].re_elacoin3
            const re4_elacoin = _invest[1].re_elacoin4
            const re5_elacoin = _invest[1].re_elacoin5
            const re6_elacoin = _invest[1].re_elacoin6
            const re7_elacoin = _invest[1].re_elacoin7
            const re8_elacoin = _invest[1].re_elacoin8
            const re9_elacoin = _invest[1].re_elacoin9
            const re0_recoin = _invest[1].re_recoin0
            const re1_recoin = _invest[1].re_recoin1
            const re2_recoin = _invest[1].re_recoin2
            const re3_recoin = _invest[1].re_recoin3
            const re4_recoin = _invest[1].re_recoin4
            const re5_recoin = _invest[1].re_recoin5
            const re6_recoin = _invest[1].re_recoin6
            const re7_recoin = _invest[1].re_recoin7
            const re8_recoin = _invest[1].re_recoin8
            const re9_recoin = _invest[1].re_recoin9
        
        
            const timeFilter_a2 = moment().format('mm')
            const timeFilter_b2 = moment().format('HH')
            if (timeFilter_a2.trim()[0] <= 0) {
                var timeFilter_labels_0 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 10) - 40
                var timeFilter_labels_1 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 9) - 40
                var timeFilter_labels_2 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 8) - 40
                var timeFilter_labels_3 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 7) - 40
                var timeFilter_labels_4 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 6) - 40
                var timeFilter_labels_5 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 5) - 40
                var timeFilter_labels_6 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 4) - 40
                var timeFilter_labels_7 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 3) - 40
                var timeFilter_labels_8 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 2) - 40
                var timeFilter_labels_9 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 1) - 40
            } else {
                var timeFilter_labels_0 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 10)
                var timeFilter_labels_1 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 9)
                var timeFilter_labels_2 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 8)
                var timeFilter_labels_3 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 7)
                var timeFilter_labels_4 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 6)
                var timeFilter_labels_5 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 5)
                var timeFilter_labels_6 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 4)
                var timeFilter_labels_7 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 3)
                var timeFilter_labels_8 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 2)
                var timeFilter_labels_9 = Math.floor(`${timeFilter_b2}${timeFilter_a2}` - 1)
            };
        
            (async () => {
                const configuration = {
                    type: 'line',
                    data: {
                        labels: [numberWithCommas2(timeFilter_labels_0), numberWithCommas2(timeFilter_labels_1), numberWithCommas2(timeFilter_labels_2), numberWithCommas2(timeFilter_labels_3), numberWithCommas2(timeFilter_labels_4), numberWithCommas2(timeFilter_labels_5), numberWithCommas2(timeFilter_labels_6), numberWithCommas2(timeFilter_labels_7), numberWithCommas2(timeFilter_labels_8), numberWithCommas2(timeFilter_labels_9)],
                        datasets: [{
                                label: 'Iron',
                                //backgroundColor: 'rgba(255,0,0,0.2)',
                                backgroundColor: 'rgb(133,255,0)',
                                borderColor: 'rgba(133,255,0,2)',
                                data: [re0_iron, re1_iron, re2_iron, re3_iron, re4_iron, re5_iron, re6_iron, re7_iron, re8_iron, re9_iron]
                            },
                            {
                                label: 'Gold',
                                //backgroundColor: 'rgba(255,0,0,0.2)',
                                backgroundColor: 'rgb(241,202,29)',
                                borderColor: 'rgba(241,202,29,2)',
                                data: [re0_gold, re1_gold, re2_gold, re3_gold, re4_gold, re5_gold, re6_gold, re7_gold, re8_gold, re9_gold]
                            },
                            {
                                label: 'NaoCoin',
                                //backgroundColor: 'rgba(0,255,255,0.2)',
                                backgroundColor: 'rgb(247,52,43)',
                                borderColor: 'rgba(247,52,43,2)',
                                data: [re0_naocoin, re1_naocoin, re2_naocoin, re3_naocoin, re4_naocoin, re5_naocoin, re6_naocoin, re7_naocoin, re8_naocoin, re9_naocoin]
                            },
                            {
                                label: 'ElaCoin',
                                //backgroundColor: 'rgba(0,255,255,0.2)',
                                backgroundColor: 'rgb(50,91,186)',
                                borderColor: 'rgba(50,91,186,2)',
                                data: [re0_elacoin, re1_elacoin, re2_elacoin, re3_elacoin, re4_elacoin, re5_elacoin, re6_elacoin, re7_elacoin, re8_elacoin, re9_elacoin]
                            },
                            {
                                label: 'ReCoin',
                                //backgroundColor: 'rgba(0,255,255,0.2)',
                                backgroundColor: 'rgb(0,128,255)',
                                borderColor: 'rgba(0,128,255,2)',
                                data: [re0_recoin, re1_recoin, re2_recoin, re3_recoin, re4_recoin, re5_recoin, re6_recoin, re7_recoin, re8_recoin, re9_recoin]
                            }
                        ]
                    },
                    options: {
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Market'
                            }
                        },
                        scales: {
                            y: {
                                display: true,
                                beginAtZero: true,
                                min: 0,
                                max: 400000,
                                //stepsize: 20000
                            }
                        }
                    },
                    plugins: [{
                        id: 'background-colour',
                        beforeDraw: (chart) => {
                            const width = 1920; //px
                            const height = 1080; //px
                            const ctx = chart.ctx;
                            ctx.save();
                            ctx.fillStyle = '#1F2633';
                            ctx.fillRect(0, 0, width, height);
                            ctx.restore();
                        }
                    }]
                };
        
                const imageBuffer1 = await canvasRenderService1.renderToBuffer(configuration);
        
                // Write image to file
                await fs.writeFileSync('./lib/cache/chart/invest.png', imageBuffer1);
            })();
            
            const _rumahRegenEnergy = {
                "16": 5,
                "28": 15,
                "36": 25,
                "49": 35,
                "52": 45,
                "63": 55,
                "75": 65,
                "86": 75,
                "99": 85,
                "01": 95,
                "69": 110,
                "77": 130,
                "757": 150,
                "879": 195
            }
            const _userDbAll = await _mongo_UserSchema.find({})
            for (let ia = 0; ia < _userDbAll.length; ia++) {
                const _makan = _userDbAll[ia].rl.food
                const _stamina = _userDbAll[ia].rl.stamina
                if (_makan >= 0) {
                    await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $inc: { "rl.food": -1 } })
                }
                if (_stamina <= 200) {
                    if (_userDbAll[ia].rl.rumah != undefined) {
                        let position = await _userDbAll[ia].rl.rumah
                        if (position.listrikstatus == 'mati') {
                            var staminaRegen = 3
                        } else if (position.crid != undefined) {
                            var staminaRegen = _rumahRegenEnergy[position.crid]
                        } else {
                            var staminaRegen = 3
                        }
    
                        const calculateValueInput = Math.floor(_stamina + staminaRegen)
                        if (calculateValueInput <= 200) {
                            await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $inc: { "rl.stamina": staminaRegen } })
                        } else {
                            await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $set: { "rl.stamina": 200 } })
                        }
                    } else {
                        const calculateValueInput2 = Math.floor(_stamina + 3)
                        if (calculateValueInput2 <= 200) {
                            await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $inc: { "rl.stamina": 3 } })
                        } else {
                            await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $set: { "rl.stamina": 200 } })
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err)
        }
    
        await _mongo_UserSchema.updateMany({ 'rl.pd.food': -1, 'rl.pd.mal_id': { $exists: false } }, {'rl.pd': {}})
        // await checkNolHubunganPasangan()
    })


    cron.schedule("*/3 * * * *", async () => {
        const _pasangan = await _mongo_UserSchema.find({ "rl.pd.mal_id": { $exists: true } })
    
        for (let ai = 0; ai < _pasangan.length; ai++) {
            if(_pasangan[ai]?.rl?.pd?.food == undefined || _pasangan[ai]?.rl?.pd?.nama == undefined) continue;
            if (Math.floor(_pasangan[ai].rl.pd.food) <= 0 && Math.floor(_pasangan[ai].rl.pd.uang) >= 40000) {
                await _mongo_UserSchema.updateOne({ iId: _pasangan[ai].iId }, { $inc: { "rl.pd.uang": -40000, "rl.pd.food": 100 } })
            } else if (Math.floor(_pasangan[ai].rl.pd.food) <= 0 && Math.floor(_pasangan[ai].rl.pd.uang) >= 20000) {
                await _mongo_UserSchema.updateOne({ iId: _pasangan[ai].iId }, { $inc: { "rl.pd.uang": -20000, "rl.pd.food": 70 } })
            } else if (Math.floor(_pasangan[ai].rl.pd.food) <= 0 && Math.floor(_pasangan[ai].rl.pd.uang) >= 15000) {
                await _mongo_UserSchema.updateOne({ iId: _pasangan[ai].iId }, { $inc: { "rl.pd.uang": -15000, "rl.pd.food": 50 } })
            } else if (Math.floor(_pasangan[ai].rl.pd.food) <= 0 && Math.floor(_pasangan[ai].rl.pd.uang) <= 14999) {
                await _mongo_UserSchema.updateOne({ iId: _pasangan[ai].iId }, { $inc: { "rl.pd.hubungan": -1 } })
            } else if(Math.floor(_pasangan[ai].rl.pd.food) >= 1) {
                await _mongo_UserSchema.updateOne({ iId: _pasangan[ai].iId }, { $inc: { "rl.pd.food": -1 } })
            }
        }
        console.log('Check Food Pasangan')
    })

    cron.schedule("12 * * * *", async function () {
        const checkHamilPasangan = async () => {
            const _pasangan = await _mongo_UserSchema.find({ "rl.pd.status2": /^Hamil/ })
            for (let i = 0; i < _pasangan.length; i++) {
                if (_pasangan[i].rl.pd.status2.startsWith('Hamil')) {
                    console.log('a')
                    const berapaBulan = Number(_pasangan[i].rl.pd.status2.split('.')[1])
                    if (berapaBulan >= 9) {
                        console.log('b')
                        const randomGender0 = ["Cowo", "Cewe"]
                        const randomGender = randomGender0[Math.floor(Math.random() * randomGender0.length)]
                        await _mongo_UserSchema.updateOne({ _id: _pasangan[i]._id }, { $set: { "rl.pd.status2": _pasangan[i].rl.pd.status2.replace('Hamil', 'ConfirmHamil'), "rl.pd.nkkand": [{
                            id: GenerateSerialNumber("000000000000"),
                            lahir: Date.now(),
                            gender: randomGender
                        }] } })
                    } else {
                        console.log('c')
                        await _mongo_UserSchema.updateOne({ _id: _pasangan[i]._id }, { $set: { "rl.pd.status2": `Hamil.${berapaBulan + 1}` } })
                    }
                }
            }
            console.log('Success! Check Hamil Pasangan')
        }
        await checkHamilPasangan()
    })

    cron.schedule("*/10 * * * *", async function () {
        const _delTime = JSON.parse(fs.readFileSync('./lib/database/web/deltime.json'))
    
        const delTimeCheck = async (_dir) => {
            var checkIlangObject = _dir
            var dateNowCheckIlangObject = Date.now()
            for (let i = 0; i < checkIlangObject.length; i++) {
                if (dateNowCheckIlangObject >= checkIlangObject[i].time) {
                    console.log(`DELETE FILE: ${checkIlangObject[i].file}`)
                    try {
                        await fs.unlinkSync(checkIlangObject[i].file)
                        await checkIlangObject.splice(i, 1)
                    } catch (err) {
                        console.error(err)
                        await checkIlangObject.splice(i, 1)
                    }
                }
            }
            fs.writeFileSync('./lib/database/web/deltime.json', JSON.stringify(checkIlangObject))
        }
        await delTimeCheck(_delTime)
    })

    cron.schedule("10 23 * * *", async function () {
        await _mongo_BotSchema.updateOne({ iId: 'CORE' }, { $set: { "hits.today": 0 } })

        await _mongo_UserSchema.updateMany({ "limit.lgivein": { $exists: true } }, { $set: { "limit.lgivein": [] } })

        await _mongo_CommandSchema.updateOne({ cId: 'zerochan' }, { $set: { "content": [] } })
        await _mongo_CommandSchema.updateOne({ cId: 'lewd' }, { $set: { "content": [] } })
    
        // var _countGroupMessage0 = JSON.parse(fs.readFileSync('./lib/database/group/count.json'))
        // for (let i = 0; i < _countGroupMessage0.length; i++) {
        //     _countGroupMessage0[i].msg0 = _countGroupMessage0[i].msg1
        //     _countGroupMessage0[i].msg1 = _countGroupMessage0[i].msg2
        //     _countGroupMessage0[i].msg2 = _countGroupMessage0[i].msg3
        //     _countGroupMessage0[i].msg3 = _countGroupMessage0[i].msg4
        //     _countGroupMessage0[i].msg4 = _countGroupMessage0[i].msg5
        //     _countGroupMessage0[i].msg5 = _countGroupMessage0[i].msg6
        //     _countGroupMessage0[i].msg6 = _countGroupMessage0[i].msg7
        //     _countGroupMessage0[i].msg7 = _countGroupMessage0[i].msg8
        //     _countGroupMessage0[i].msg8 = _countGroupMessage0[i].msg9
        //     _countGroupMessage0[i].msg9 = 0
        //     _countGroupMessage0[i].cmd0 = _countGroupMessage0[i].cmd1
        //     _countGroupMessage0[i].cmd1 = _countGroupMessage0[i].cmd2
        //     _countGroupMessage0[i].cmd2 = _countGroupMessage0[i].cmd3
        //     _countGroupMessage0[i].cmd3 = _countGroupMessage0[i].cmd4
        //     _countGroupMessage0[i].cmd4 = _countGroupMessage0[i].cmd5
        //     _countGroupMessage0[i].cmd5 = _countGroupMessage0[i].cmd6
        //     _countGroupMessage0[i].cmd6 = _countGroupMessage0[i].cmd7
        //     _countGroupMessage0[i].cmd7 = _countGroupMessage0[i].cmd8
        //     _countGroupMessage0[i].cmd8 = _countGroupMessage0[i].cmd9
        //     _countGroupMessage0[i].cmd9 = 0
        // }

        // fs.writeFileSync('./lib/database/group/count.json', JSON.stringify(_countGroupMessage0))
    
        const _rumahListrikHarga = {
            "16": 5000,
            "28": 20000,
            "36": 60000,
            "49": 150000,
            "52": 250000,
            "63": 500000,
            "75": 1000000,
            "86": 3000000,
            "99": 6000000,
            "01": 10000000,
            "69": 50000000,
            "77": 100000000,
            "757": 7000000000,
            "879": 8000000000000
        }
    
        const _userDbAll = await _mongo_UserSchema.find({ "rl.rumah": { $exists: true } })
        for (let ia = 0; ia < _userDbAll.length; ia++) {
            const hargaBayarListrik = _rumahListrikHarga[_userDbAll[ia].rl.rumah.crid]
            let money = _userDbAll[ia].economy.money

            if (money != undefined) {
                if (money > hargaBayarListrik) {
                    console.log('Bayar listrik')
                    await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $inc: { "economy.money": -hargaBayarListrik }, $set: { "rl.rumah.listrikstatus": 'dibayar', "rl.rumah.lastlistrikbayar": Date.now() } })
                } else {
                    await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $set: { "rl.rumah.listrikstatus": 'mati' } })
                }
            } else {
                await _mongo_UserSchema.updateOne({ _id: _userDbAll[ia]._id }, { $set: { "rl.rumah.listrikstatus": 'mati' } })
            }
        }

        try {
            await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '120363021660813196@g.us', data: '*/Daily Backup\*\n\nSedang dilakukan backup Database\nMungkin akan ngelag untuk beberapa saat', options: {} })
        } catch (err) {
            console.error('Failed sendText to botAPI', err)
        }

        console.log('Begin backup')

        const listCollection = ['auth_core', 'bot', 'command', 'contact_name', 'group', 'user']
        try {
            await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '6285808267498@s.whatsapp.net', data: `Backup ${moment().format('DD-MM-YYYY')}`, options: {} })
        } catch (err) {
            console.error('Failed sendText to botAPI_0', err)
        }
        for (let i = 0; i < listCollection.length; i++) {
            const filePathBackup = `${process.cwd()}/lib/cache/backup/`
            let backupProcess = spawn('mongoexport', [
                `--uri="${process.env.MONGODB_PRODUCTION_URI}"`,
                '--jsonArray',
                '--quiet',
                `--collection=${listCollection[i]}`,
                `--out=${filePathBackup}/${listCollection[i]}.json`
            ]);
            
            backupProcess.on('exit', async (code, signal) => {
                if(code)  {
                    console.log('Backup process exited with code ', code);

                    try {
                        await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '6281358181668-1621640771@g.us', data: '*!! WARNING !!*\nBackup process exited with code ' + code, options: {} })
                    } catch (err) {
                        console.error('Failed sendText to botAPI_1', err)
                    }
                } else if (signal) {
                    console.error('Backup process was killed with singal ', signal);

                    try {
                        await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '6281358181668-1621640771@g.us', data: '*!! WARNING !!*\nBackup process was killed with singal ' + signal, options: {} })
                    } catch (err) {
                        console.error('Failed sendText to botAPI_2', err)
                    }
                } else {
                    console.log('Successfully backedup the database')
    
                    try {
                        await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendMessage', number: '6285808267498@s.whatsapp.net', data: { document: { url: `${filePathBackup}/${listCollection[i]}.json` }, mimetype: 'application/json', fileName: `${moment().format('DD-MM-YYYY')}.${listCollection[i]}.json` }, options: {} })
                    } catch (err) {
                        console.error('Failed sendMessage to botAPI_4', err)
                    }
                    fs.unlinkSync(`${filePathBackup}/${listCollection[i]}.json`)
                }
            });

            //last loop
            if(i == listCollection.length - 1) {
                try {
                    await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '120363021660813196@g.us', data: '*/Daily Backup\*\n\nBerhasil melakukan backup Database', options: {} })
                } catch (err) {
                    console.error('Failed sendText to botAPI_3', err)
                }
                
                try {
                    await axios.post('http://localhost:7516/api/v2/post/useBotMethod', { method: 'sendText', number: '6285808267498@s.whatsapp.net', data: `Backup ${moment().format('DD-MM-YYYY')}`, options: {} })
                } catch (err) {
                    console.error('Failed sendText to botAPI_0', err)
                }
            }
        }
    })
    

    // cron.schedule("0 1 * * *", async function () {
    //     const cheerio = require('cheerio')
    //     const puppeteer = require('puppeteer');
    //     const browser = await puppeteer.launch({
    //         headless: true, 
    //         args: [
    //             '--no-sandbox',
    //             '--disable-setuid-sandbox'
    //         ]
    //     });
    //     const page = (await browser.pages())[0]; // Use the default tab instead of making a new one.
    //     await page.goto(`https://elearning.denjk.my.id/`, {
    //         waitUntil: 'networkidle0'
    //     });

    //     await page.type('input[type="text"]', '0076167269');
    //     await page.type('input[type="password"]', '0T6BM9');
    //     await Promise.all([
    //         page.waitForNavigation(),
    //         page.click('button[type="submit"]')
    //     ]);

    //     await page.click('div[class="introjs-overlay"]')
    //     let bodyHtmlElearning = await page.evaluate(() => document.documentElement.outerHTML);
    //     //console.log(bodyHtmlElearning)

    //     var urlKelasScrapeElearning = []
    //     const $ = cheerio.load(bodyHtmlElearning)
    //     $('div[class="header-data"]').each((a, b) => {
    //         $(b).find('ul[style="background-color:#252b87;color:white;"]').each(function (c, d) {
    //             $(d).find("li").each(function (e, f) {
    //                 $(f).find("a").each(function (g, h) {
    //                     if ($(h).attr('href').startsWith('http')) {
    //                         if ($(h).attr('href') != 'https://elearning.denjk.my.id/studentmaster/kelas') {
    //                             if ($(h).attr('href') != 'https://elearning.denjk.my.id/student') {
    //                                 urlKelasScrapeElearning.push($(h).attr('href'))
    //                             }
    //                         }
    //                     }
    //                 })
    //             })
    //         })
    //     })

    //     for (let i = 0; i < urlKelasScrapeElearning.length; i++) {
    //         await page.goto(`${urlKelasScrapeElearning[i]}`, {
    //             waitUntil: 'networkidle0'
    //         });
    //         await Promise.all([
    //             page.click('a[id="konfirmasikehadiran"]'),
    //             page.waitForNavigation({
    //                 waitUntil: 'networkidle0'
    //             }),
    //         ]);
    //     }

    //     await console.log(urlKelasScrapeElearning)
    //     await sleep(5000)
    //     await page.close()
    //     await browser.close()
    //     await console.log('Succes Absensi')
    // })
})