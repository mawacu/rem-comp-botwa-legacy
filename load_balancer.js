require('dotenv').config();

const axios = require('axios');
const express = require('express');
const pm2 = require('pm2');

const app = express();
app.use(express.urlencoded({ limit: "500mb", extended: true, parameterLimit: 5000000000 }));
app.use(express.json({ limit: "500mb", parameterLimit: 5000000000 }));

const PORT = 7517;
const clientSrv = []
let loopCheck = 1;
for(let i = 1; process.env[`CLIENTJB2_${loopCheck}_URL`]; i++) {
    if(process.env[`CLIENTJB2_${loopCheck}_URL`]) {
        clientSrv.push({ name: `CLIENTJB2_${loopCheck}_URL`, url: process.env[`CLIENTJB2_${loopCheck}_URL`], port: process.env[`CLIENTJB2_${loopCheck}_PORT`] });
    } else {
        break;
    }
    loopCheck++;
}

app.get('/', (req, res) => {
    res.json({ err: false, message: 'Load Balancer is running', numClient: clientSrv.length })
})

app.post('/v3/webhook/message', async (req, res, next) => {
    console.log('Incoming Webhook Message', req.body?.jsonData )
    if(!req.body?.jsonData) return res.status(400).send({ err: true, message: 'Invalid Request' })

    const { token } = req.body
    if(!token) return res.status(400).send({ err: true, message: 'Invalid Token' })

    res.send({ err: false })

    // random client
    const randomClient = Math.floor(Math.random() * clientSrv.length);
    const client = clientSrv[randomClient];
    const url = `${client.url}/v3/webhook/message`;
    
    async function retryAgain(retry = 0) {
        try {
            console.log(`Forwarding to Client ${randomClient + 1} (${client.url}) | Attempt: ${retry + 1}`)
            const response = await axios.post(url, req.body)
            console.log(`Forwarded to Client ${randomClient + 1} (${client.url}) | Status: ${JSON.stringify(response.data)}`)
        } catch (error) {
            if(retry < 3) {
                retry++;
                return retryAgain(retry)
            }
        }
    }
    retryAgain()
})

// start server
pm2.connect(async (err) => {
    console.log('pm2 connected')
    if(err) {
        console.error(err)
        process.exit(2)
    }

    for(let i = 0; i < clientSrv.length; i++) {
        console.log(`Starting Client ${i+1}: ${clientSrv[i].url}`)
        pm2.start({
            name: `client-${i+1}`,
            script: 'jadibot_whatsmeow.js',
            max_memory_restart: '3072M',
            args: `--key=${process.env.KEY_CLIENT} --server=${i + 1} --serverPort=${clientSrv[i].port}`,
            shutdown_with_message: true,
            kill_timeout: 10000,
            cron_restart: '*/60 * * * *',
            env: {
                LD_PRELOAD: '/usr/lib/aarch64-linux-gnu/libjemalloc.so'
            }
        }, (err, apps) => {
            if(err) {
                console.error('pm2 start', err)
                process.exit(2)
            }
        })
    }
})

app.listen(PORT, () => {
    console.log(`Load Balancer running on port ${PORT}`)
})