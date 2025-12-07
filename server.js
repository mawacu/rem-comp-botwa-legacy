require('dotenv').config()
const express = require('express');
const device = require('express-device');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs-extra')
const fetch = require('node-fetch')
const router = express.Router();
const app = express();
const axios = require('axios')
const os = require('os')
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone')
const exec = require('child_process').exec;
const nhentai = require('nhentai')
const NhenApi = new nhentai.API();
const nhzipdl = require('nhentaidownloader');
const PDFDocument = require('pdfkit');
const unzipper = require('unzipper')
const { sleep, getHitsCount, addDelTime, GenerateSerialNumber } = require('./lib/functions');

moment.tz.setDefault('Asia/Jakarta').locale('id');

/*const localtunnel = require('localtunnel');

(async () => {
  const subdomainRequest = JSON.parse(fs.readFileSync('./lib/database/web/subdomain.json'))
  const numbersubdomainRequest = subdomainRequest[0].trim().split('i')[2]
  const subdomain = 'dwiqi'+Math.floor(Math.floor(numbersubdomainRequest) + 1)
  const tunnel = await localtunnel(80, { subdomain: subdomain })

  console.log('Port is Open '+tunnel.url)
  fs.writeFileSync('./lib/database/web/subdomain.json', JSON.stringify([subdomain]))

  tunnel.on('close', () => {
    console.log('Port is closed')
  });
})()*/

app.use(session({
    secret: 'hehe:v',
    // create new redis store.
    //store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: true
}));
app.set('trust proxy', true)
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 5000000000 }));
app.use(bodyParser.json({ limit: "500mb", parameterLimit: 5000000000 }));
//app.use('/assets', express.static(__dirname + '/assets'));
app.use('/lib/src', express.static(__dirname + '/lib/src'));
app.use(device.capture());

router.get('/',(req,res) => {
    console.log('Client IP : ' + req.ip)
    var sess = req.session;
    if(sess.login) {
        return res.redirect('/dashboard');
    }
    return res.redirect('/login')
});

/*//FileAccess For Bot2
router.post('/bot/api/functions/:function', async (req, res) => {
    const keyAccessAPIBotData = 'pj0GqNfO7G'
    const uniqueCodeForAPIAccess = '0VdedSX8GZ'
    if(req.body.keyAccess == null || req.body.keyAccess != keyAccessAPIBotData || req.body.uniqueCode == null || req.body.uniqueCode != uniqueCodeForAPIAccess) return res.send('403!')
    if(req.params.function == null) return res.send({status: 'error', message: 'Function not found!'})

    const splitFunction = 
})*/

// Login

router.get('/login', (req,res) => {
    console.log('Client IP : ' + req.ip)
    if(req.query.no == "true") {
        if(!req.session.login) {
            req.session.login = false
            res.sendFile(__dirname + '/lib/src/login/index-error.html')
        } else if(req.session.login) {
            res.redirect('/dashboard')
        }
    } else {
        if(!req.session.login) {
            req.session.login = false
            res.sendFile(__dirname + '/lib/src/login/index.html')
        } else if(req.session.login) {
            res.redirect('/dashboard')
        }
    }
});

router.get('/hehe', (req,res) => {
    res.send(`<p>Aku seneng duwe konco koyok amu</p>

<p>Isok dijak omong koyok konco pada umum e.</p>
amu eroh gk?, Aku kek awal metu/lulus MI gk/jarang ngomong ambek cwe sak pantaran ku/Sak umuranku.
Ngomong ae gagap /_ \</p>
    
<p>pas aku nok kondisi ngunuku, onok amu, seng isok ngomong ambek aku sak plonge e, tanpa gagap2.
_y jek gagap titik se ;v_</p>
    
    
    
<p>Y onok eneh se sakjane, cuman bingung jelasno e
Sumpah, susah jelasno e, Gk cukup berani aku <(＿　＿)></p>
    
    
<p>Pokok e the best lah, beruntung aku duwe bestie koyok amu
Suwon wes dadi bestie ku ヾ(≧▽≦*)o</p>
    
<p>_tekok google jarene bestie iku menyebut seseorang yang spesial dalam hubungan_
y kira2 ngunukui</p>
    `)
})

router.get('/hehe2', (req,res) => {
    res.send(`
<p>Nek aku oleh jujur
Aku jek due rasa ambek amu, opo yo istilah e, 愛</p>

<p>Kate ngunu, cuman kan gk oleh (Q.S. Al-Isra: 32)
Mangkane iku, aku bakal Belajar dengan giat, demi mencapai cita2/impian ku ヾ(≧▽≦*)o
trus kerja, kumpulkan banyak duid, mencapai hidup yang sekiranya mencukupi/lebih dari cukup</p>
<p style="font-size:2px;">Dan melamarmu<p>
<p>Lanjutane pasti eroh kan?
Sodok malu aku ngomong e ＞﹏＜
Nek amu ndelok pesan iki, ojok canggung :v, melok canggung aku engkok, sak iki kanca an ae sek</p>`)
})

router.get('/status', async (req, res) => {
    res.sendFile(__dirname + '/lib/src/status.html')
})

router.get('/status-server', async (req, res) => {
    res.sendFile(__dirname + '/lib/src/status-server.html')
})

// Dashboard

router.get('/dashboard',(req,res) => {
    //console.log('dashboard')
    //console.log(req.session)
    if(req.session.login) {
        //console.log('session found2')
        res.sendFile(__dirname + '/lib/src/home/dashboard.html')
    } else {
        //console.log('session not found')
        res.redirect('/login')
    }
});

router.get('/logout',(req,res) => {
    if(!req.session.login) return res.redirect('/login')
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/login');
    });

});

router.post('/api/dashboard', async (req, res) => {
    if(!req.session.login) return res.redirect('/login')

    const _nama = JSON.parse(fs.readFileSync('./lib/database/user/nama.json'))
    const getNama = (userId) => {
        let position = false
        Object.keys(_nama).forEach((i) => {
            if (_nama[i].id === userId) {
                position = i
            }
        })
        if (position !== false) {
            return _nama[position].nama
        }
    }
    
    const resp = JSON.parse(fs.readFileSync('./lib/database/user/level.json'))
    let respp = []
    resp.sort((a, b) => (a.xp < b.xp) ? 1 : -1)

    const resp_money = JSON.parse(fs.readFileSync('./lib/database/user/money.json'))
    let respp_money = []
    resp_money.sort((a, b) => (a.money < b.money) ? 1 : -1)

    for (let i = 0; i < 5; i++) {
        var namalvl0 = await axios.post('http://localhost:7517/api/post/user/getusercontact', {
            id: resp[i].id,
        })
        var namalvl01 = getNama(resp[i].id)
        if(namalvl01 == undefined) {
            if(namalvl0.data == null) {
                var namalvl = ''
            } else if(namalvl0.data.notify == undefined) {
                if(namalvl0.data.name == undefined) {
                    if(namalvl0.data.vname == undefined) {
                        var namalvl = ''
                    } else {
                        var namalvl = namalvl0.data.vname
                    }
                } else {
                    var namalvl = namalvl0.data.name
                }
            } else {
                var namalvl = namalvl0.data.notify
            }
        } else {
            var namalvl = namalvl01
        }

        const sendPush_respp = { id: resp[i].id, name: namalvl, xp: resp[i].xp, level: resp[i].level }
        respp.push(sendPush_respp)
    }

    for(let i = 0; i < 5; i++) {
        var namasultan0 = await axios.post('http://localhost:7517/api/post/user/getusercontact', {
            id: resp_money[i].id,
        })
        var namasultan01 = getNama(resp_money[i].id)
        if(namasultan01 == undefined) {
            if(namasultan0.data == null) {
                var namasultan = ''
            } else if(namasultan0.data.notify == undefined) {
                if(namasultan0.data.name == undefined) {
                    if(namasultan0.data.vname == undefined) {
                        var namasultan = ''
                    } else {
                        var namasultan = namasultan0.data.vname
                    }
                } else {
                    var namasultan = namasultan0.data.name
                }
            } else {
                var namasultan = namasultan0.data.notify
            }
        } else {
            var namasultan = namasultan01
        }

        const sendPush_respp_money = { id: resp_money[i].id, name: namasultan, money: resp_money[i].money }
        respp_money.push(sendPush_respp_money)
    }


    res.send({ invest: JSON.parse(fs.readFileSync('./lib/database/user/invest.json')), lb: respp, lm: respp_money })
})

// UserSetting

router.get('/usersetting',(req,res) => {
    if(req.session.login) {
        res.sendFile(__dirname + '/lib/src/usersetting/usersetting.html')
    } else {
        res.redirect('/login')
    }
});

// GroupSetting

router.get('/groupsetting', async (req,res) => {
    if(req.session.email == null) return res.redirect('/login')
    //console.log('name '+req.session.email)
    if(req.session.login) {
        await axios.post('http://localhost:7517/api/post/group/isadmingroupall', {
            id: req.session.email,
          })
          .then(function (response) {
            //console.log(response.data);
            req.session.group = response.data
          })
        await res.sendFile(__dirname + '/lib/src/groupsetting/groupsetting.html')
    } else {
        res.redirect('/login')
     }
});

router.get('/groupsetting/group', async (req,res) => {
    if(req.session.email == null) return res.redirect('/login')
    if(req.session.group == null) return res.redirect('/groupsetting')
    if(req.query.id == null) return res.send('Invalid')
    if(req.session.group.includes(req.query.id)) {
        if(req.session.login) {
            if(req.query.act == 'general') {
                res.sendFile(__dirname + '/lib/src/group/group-general.html')
            } else if(req.query.act == 'member') {
                res.sendFile(__dirname + '/lib/src/group/group-member.html')
            } else if(req.query.act == 'sider') {
                res.sendFile(__dirname + '/lib/src/group/group-sider.html')
            } else if(req.query.act == 'command') {
                res.sendFile(__dirname + '/lib/src/group/group-command.html')
            } else if(req.query.act == 'setting') {
                res.sendFile(__dirname + '/lib/src/group/group-setting.html')
            } else {
                res.sendFile(__dirname + '/lib/src/group/group-general.html')
            }
        } else {
            res.redirect('/login')
        }
    } else {
        return res.send('Invalid')
    }
})

// API
router.get('/api/usersessiondata', (req, res) => {
    if(req.session.login) {
        res.send(req.session)
    } else {
        res.redirect('/login')
    }
})

router.get('/api/usercontact', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    try {
        var contactUser = []
        await axios.post('http://localhost:7517/api/post/user/getusercontact', {
            id: req.query.id,
        })
        .then(function (response) {
            contactUser = response.data
        })
        //console.log(contactUser)
        res.send(contactUser)
    } catch (err) {
        //console.log(err)
        return res.send('error')
    }
})

router.get('/api/usergrouplist', (req, res) => {
    if(req.session.login) {
        //console.log(req.session.group)
        res.send(req.session.group)
    } else {
        res.redirect('/login')
    }
})

router.get('/api/getgrouppp', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    try {
    var groupPP = ''
    await axios.post('http://localhost:7517/api/post/img/getgrouppp', {
        id: req.query.id,
    })
    .then(function (response) {
        //console.log(response.data);
        groupPP = response.data
    })
   const responses = await fetch(groupPP);
   const buffer = await responses.buffer();
   await fs.writeFileSync(`./lib/src/img/${req.query.id}.png`, buffer)
   res.send('Succes')
} catch (err) {
    console.log(err)
}
})

router.get('/api/getgroupname', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    var groupName = []
    await axios.post('http://localhost:7517/api/post/group/getgroupname', {
        id: req.query.id,
    })
    .then(function (response) {
        //console.log(response.data);
        groupName = response.data
    })
    //console.log(groupName)
    res.send(groupName)
});

router.get('/api/getgrouplink', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    var groupLink = ''
    await axios.post('http://localhost:7517/api/post/group/getgrouplink', {
        id: req.query.id,
    })
    .then(function (response) {
        //console.log(response.data);
        groupLink = response.data
    })
    res.send(groupLink)
});

router.get('/api/getgroupmember', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    var groupMembersHehe = []
    await axios.post('http://localhost:7517/api/post/group/getgroupmember', {
        id: req.query.id,
    })
    .then(function (response) {
        //console.log(response.data);
        groupMembersHehe = response.data
    })
    res.send(groupMembersHehe)
})

router.get('/api/getgroupadmin', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    var groupAdminHehe = []
    await axios.post('http://localhost:7517/api/post/group/getgroupadmin', {
        id: req.query.id,
    })
    .then(function (response) {
        //console.log(response.data);
        groupAdminHehe = response.data
    })
    res.send(groupAdminHehe)
})

router.post('/api/editgroupmember', async (req, res) => {
    if(req.session.email == null) return res.redirect('/login')
    if(req.session.group == null) return res.redirect('/groupsetting')
    if(req.body.id == null) return res.send('Invalid')
    if(req.body.list == null) return res.send('Invalid')
    if(req.body.act == null) return res.send('Invalid')
    if(req.session.login) {
        if(req.body.act == 'kick') {
            try {
                var messageAPI = []
                await axios.post('http://localhost:7517/api/post/group/editgroupmember', {
                    id: req.body.id,
                    list: req.body.list,
                    act: 'kick'
                })
                .then(function (response) {
                    //console.log(response.data);
                    messageAPI = response.data
                })
                if(messageAPI == 'succes') {
                    return res.send('succes')
                } else if(messageAPI == 'error') {
                    return res.send('error')
                } else if(messageAPI == 'Invalid') {
                    return res.send('error')
                }
            } catch (err) {
                console.log(err)
                return res.send('error')
            }
        } else if(req.body.act == 'kicksider') {
            try {
                var messageAPI = []
                    await axios.post('http://localhost:7517/api/post/group/editgroupmember', {
                        id: req.body.id,
                        list: req.body.list,
                        act: 'kick'
                    })
                    .then(function (response) {
                        //console.log(response.data);
                        messageAPI = response.data
                    })
                    if(messageAPI == 'succes') {
                        res.send('succes')
                    } else if(messageAPI == 'error') {
                        res.send('error')
                    } else if(messageAPI == 'Invalid') {
                        res.send('error')
                    }
                for(let i = 0; i < req.body.list.length; i++) {
                    const countMdataCheck = JSON.parse(fs.readFileSync(`./lib/database/group/antisider/database/${req.body.id}.json`))
                    const getSiderMemberPosition = (userId) => {
                        let position = null
                        Object.keys(countMdataCheck).forEach((i) => {
                            if (countMdataCheck[i].id === userId) {
                                position = i
                            }
                        })
                        if (position !== null) {
                            return position
                        }
                    }
                    countMdataCheck.splice(getSiderMemberPosition(req.body.list[i].id), 1)
                    fs.writeFileSync(`./lib/database/group/antisider/database/${req.body.id}.json`, JSON.stringify(countMdataCheck))
                }
            } catch (err) {
                console.log(err)
                return res.send('error')
            }
        } else if(req.body.act == 'mkadmin') {
            try {
                var messageAPI = []
                    await axios.post('http://localhost:7517/api/post/group/editgroupmember', {
                        id: req.body.id,
                        list: req.body.list,
                        act: 'mkadmin'
                    })
                    .then(function (response) {
                        //console.log(response.data);
                        messageAPI = response.data
                    })
                    if(messageAPI == 'succes') {
                        res.send('succes')
                    } else if(messageAPI == 'error') {
                        res.send('error')
                    } else if(messageAPI == 'Invalid') {
                        res.send('error')
                    }
            } catch (err) {
                console.log(err)
                return res.send('error')
            }
        } else if(req.body.act == 'dmtadmin') {
            try {
                var messageAPI = []
                    await axios.post('http://localhost:7517/api/post/group/editgroupmember', {
                        id: req.body.id,
                        list: req.body.list,
                        act: 'dmtadmin'
                    })
                    .then(function (response) {
                        //console.log(response.data);
                        messageAPI = response.data
                    })
                    if(messageAPI == 'succes') {
                        res.send('succes')
                    } else if(messageAPI == 'error') {
                        res.send('error')
                    } else if(messageAPI == 'Invalid') {
                        res.send('error')
                    }
            } catch (err) {
                console.log(err)
                return res.send('error')
            }
        }
    }
});

router.post('/api/setgroupdata', async (req, res) => {
    if(req.session.email == null) return res.redirect('/login')
    if(req.session.group == null) return res.redirect('/groupsetting')
    if(req.body.id == null) return res.send('Invalid')
    if(req.body.name == null) return res.send('Invalid')
    if(req.body.admin == null) return res.send('Invalid')
    if(req.session.group.includes(req.body.id)) {
        if(req.session.login) {
            try {
                var messageAPI = []
                    await axios.post('http://localhost:7517/api/post/group/setgroupdata', {
                        id: req.body.id,
                        name: req.body.name,
                        admin: req.body.admin
                    })
                    .then(function (response) {
                        //console.log(response.data);
                        messageAPI = response.data
                    })
                if(messageAPI == 'succes') {
                    res.send('succes')
                } else if(messageAPI == 'error') {
                    res.send('error')
                } else if(messageAPI == 'Invalid') {
                    res.send('error')
                }
            } catch (err) {
                console.log(err)
                return res.send('error')
            }
        } else {
            res.redirect('/login')
        }
    } else {
        res.redirect('/groupsetting')
    }
})

router.get('/api/loginpost', async (req, res) => {
    if(req.query.user == null) return res.send('Invalid')
    if(req.query.pass == null) return res.send('Invalid')
    var user_name = decodeURI(req.query.user);
    var password = decodeURI(req.query.pass);
    console.log("Check User name = "+user_name+", password is "+password);
    const loginFile_database = JSON.parse(fs.readFileSync('./lib/database/web/user.json'))

    const getLoginData = (userId) => {
        let position = null
        Object.keys(loginFile_database).forEach((i) => {
            if (loginFile_database[i].id === userId) {
                position = i
            }
        })
        if (position !== null) {
            return loginFile_database[position]
        }
    }
    
    const resultCheckLogin = await getLoginData(user_name)
    console.log(resultCheckLogin)
    if(resultCheckLogin == undefined || resultCheckLogin.password != password) {
        console.log('SLAH')
        //var stringUrl = encodeURIComponent('true')
        //res.sendFile(__dirname + '/lib/src/login/index-error.html')
        res.send('false')
    } else if(password == resultCheckLogin.password) {
        console.log('BTUL')
        req.session.email = user_name+'@s.whatsapp.net'
        req.session.pass = password
        req.session.login = true
        try {
            var getPicPP = []
            var APIBotStatus = ''
            await axios.post('http://localhost:7517/api/post/img/getuserpp', {
                id: req.session.email,
                validateStatus: () => true
            })
            .then(function (response) {
                if(response.status != 200) {
                    APIBotStatus = response.status
                } else {
                    APIBotStatus = response.status
                    getPicPP = response.data
                }
            })
            if (APIBotStatus != 200) {
                var getPicPP = '/lib/src/assets/img/anime3.png'
                fs.writeFileSync(`./lib/src/img/${req.session.email}.png`, getPicPP)
            } else {
                if (getPicPP === 'ERROR: 404' || getPicPP === 'ERROR: 401') {
                    var getPicPP = '/lib/src/assets/img/anime3.png'
                    fs.writeFileSync(`./lib/src/img/${req.session.email}.png`, getPicPP)
                } else {
                    const responses = await fetch(getPicPP);
                    const buffer = await responses.buffer();
                    fs.writeFileSync(`./lib/src/img/${req.session.email}.png`, buffer)
                }
            }

            await axios.post('http://localhost:7517/api/post/group/isadmingroupall', {
                id: req.session.email,
              })
              .then(function (response) {
                //console.log(response.data);
                req.session.group = response.data
            })
            res.send('true')
    } catch (err) {
        console.log(err)
        var getPicPP = '/lib/src/assets/img/anime3.png'
        fs.writeFileSync(`./lib/src/img/${req.session.email}.png`, getPicPP)
        res.send('true')
    }
    } else {
        //var stringUrl = encodeURIComponent('true')
        //res.sendFile(__dirname + '/lib/src/login/index-error.html')
        res.send('false')
    }
});

router.get('/api/sider', async (req, res) => {
    if(req.query.id == null) return res.send('Invalid')
    const groupId = req.query.id
    const sider = JSON.parse(fs.readFileSync(`./lib/database/group/antisider/database/${groupId}.json`))
    sider.sort((a, b) => (a.msg < b.msg) ? 1 : -1)
    var sendModalHtmlSet = ''
    var sendKickScript = ''
    for(let i = 0; i < sider.length; i++) {
        var username = ''
        var username02 = []
        await axios.post('http://localhost:7517/api/post/user/getusercontact', {
            id: sider[i].id,
        })
        .then(function (response) {
            username02 = response
        })
        var username0 = username02.data
        //console.log(username0)
        try {
        if(username0 == 'error') {
            return
            //username = sider[i].id
        } else {
            var username01 = username0
            if(username01.notify == undefined || username01.notify == null) {
                if(username01.name == undefined || username01.name == null) {
                    if(username01.vname == undefined || username01.vname == null) {
                        username = sider[i].id
                    } else {
                        username = username01.vname
                    }
                } else {
                    username = username01.name
                }
            } else if(username01.notify != undefined) {
                username = username01.notify
            } else {
                username = sider[i].id
            }
        }
    } catch (err) {
        return console.log(err)
        //username = sider[i].id
    }
        var modalHtml = `<div class="modal fade modal-black" id="kicknyeh${i}" tabindex="-1" role="dialog" aria-labelledby="kickConfirmLabel${i}" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="kickConfirmLabel${i}">Kick Confirm</h5>
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                <i class="tim-icons icon-simple-remove"></i>
              </button>
            </div>
            <div class="modal-body">
              Apa kamu yakin? | ${username}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" id="kickConfirm${i}" class="btn btn-danger" data-dismiss="modal">Kick</button>
            </div>
          </div>
        </div>
      </div>`
        sendModalHtmlSet += modalHtml

        var kickAnalyze = `<script>
        $(document).ready(function(){
        $("#kickConfirm${i}").click(async function(){
            var keSelect = {id:"${groupId}",act:'kicksider',list:[{id:"${sider[i].id}"}]}
            console.log(keSelect)
            await $.post("/api/editgroupmember",keSelect, function(data) {
              console.log(data)
                if(data == 'error') console.log('error')
                if(data == 'Invalid') console.log('Invalid')
                if(data == 'error' || data == 'Invalid') {
                  var custom = {
                    showNotification: function(from, align, message, icon) {
                    
                        $.notify({
                          icon: icon,
                          message: message
                    
                        }, {
                          type: 'danger',
                          timer: 2000,
                          placement: {
                            from: from,
                            align: align
                          }
                        });
                      }
                  }
                custom.showNotification('top', 'center', '<b>ERROR!</b> Mungkin disebabkan oleh sistem', 'tim-icons icon-alert-circle-exc')
                } else if(data == 'succes') {
                  var custom = {
                    showNotification: function(from, align, message, icon) {
                    
                        $.notify({
                          icon: icon,
                          message: message
                    
                        }, {
                          type: 'success',
                          timer: 2000,
                          placement: {
                            from: from,
                            align: align
                          }
                        });
                      }
                }
                custom.showNotification('top', 'center', '<b>Succes!</b> Berhasil mengubah group', 'tim-icons icon-check-2')
                }
              });
            })
        })
            </script>`
            sendKickScript += kickAnalyze
    }
    //console.log(sendKickScript)
    res.send({sider: sider, modal: sendModalHtmlSet, kick: sendKickScript})
})
-
router.get('/api/status', async (req, res) => {
    if(req.query.full == 'true') {
        let hitsCount = JSON.parse(fs.readFileSync('./lib/database/bot/hits.json'))

        var cpuPercentage = ''

        await exec(`awk '{u=$2+$4; t=$2+$4+$5; if (NR==1){u1=u; t1=t;} else print ($2+$4-u1) * 100 / (t-t1) "%"; }' \
        <(grep 'cpu ' /proc/stat) <(sleep 1;grep 'cpu ' /proc/stat)`, {shell: "/bin/bash"}, async (err, stdout, stderr) => { 
            cpuPercentage = parseFloat(stdout.replace('%', ''))
            await console.log(cpuPercentage)
            if(err) {
                console.log(stderr)
            }
        })
        if(cpuPercentage == '') await sleep(2000)

        const speed_c = moment() / 1000

        var ramUsage_total = os.totalmem()
        var apiSpeed = speed_c
        var botSpeed = JSON.parse(fs.readFileSync('./lib/database/bot/record.json')[1]).bspeed
        var errorDetect_realtime = JSON.parse(fs.readFileSync('./lib/database/bot/record.json')[1]).berr
        var hitsToday = getHitsCount('today', hitsCount)
        var currentUser = JSON.parse(fs.readFileSync('./lib/database/user/userreg.json')).length

        return res.send({ ram: ramUsage_total, cpu: cpuPercentage, aspe: apiSpeed, bspe: botSpeed, err: errorDetect_realtime, ht: hitsToday, cus: currentUser })

    } else {
    if(req.query.custom != null || req.query.custom != undefined) {
        var scriptSendModalStatus = `<div class="modal modal-black" id="isAPIOnline" tabindex="-1" role="dialog" aria-labelledby="isAPIOnlineLabel" style="display: block; padding-right: 19px;" aria-modal="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="isAPIOnlineLabel"><b>Web API Down!</b></h5>
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                <i class="tim-icons icon-simple-remove"></i>
              </button>
            </div>
            <div class="modal-body" id="dynamicTimer0">
              Connecting...
            </div>
            <div class="modal-footer">
              <button type="button" id="retryNowApiCheck" class="btn btn-success" data-dismiss="modal">Retry Now</button>
              <a type="button" class="btn btn-info" href="/dashboard" data-dismiss="modal">Dashboard</a>
            </div>
          </div>
        </div>
      </div>`
    } else {
        var scriptSendModalStatus = `<div class="modal modal-black" id="isAPIOnline" tabindex="-1" role="dialog" aria-labelledby="isAPIOnlineLabel" style="display: block; padding-right: 19px;" aria-modal="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="isAPIOnlineLabel"><b>Web API Down!</b></h5>
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                <i class="tim-icons icon-simple-remove"></i>
              </button>
            </div>
            <div class="modal-body" id="dynamicTimer0">
              Connecting...
            </div>
            <div class="modal-footer">
              <button type="button" id="retryNowApiCheck" class="btn btn-success" data-dismiss="modal">Retry Now</button>
            </div>
          </div>
        </div>
      </div>`
    }
    try {
        var messageAPI = ''
        await axios.post('http://localhost:7517/api/post/status', { validateStatus: () => true })
        .then(function (response) {
            console.log(response.status);
            messageAPI = response.status
        })
        if(messageAPI != 200) {
            return res.send({ status: 'offline', scriptmodal: scriptSendModalStatus })
        } else {
            return res.send({ status: 'online', scriptmodal: scriptSendModalStatus })
        }
    } catch (err) {
        console.log(err)
        return res.send({ status: 'offline', scriptmodal: scriptSendModalStatus })
    }
}
})

//File Download and API
    //Direct Download
router.get('/doujin/:id', async (req, res) => {
    if(req.query.key != 'ahah9a8ja9faifnaifa87fg281nfinub') return res.send({status: '403!', message: 'Access Denied!'})
    if(req.params.id == null) return res.send({status: 'error', message: 'Not Number!'})
    if(isNaN(req.params.id)) return res.send({status: 'error', message: 'Not Number!'})
    //res.write('Wait!')
    //const _limitAccesDoujin = JSON.parse(fs.readFileSync('./lib/database/web/limitacces.json'))
    //if(_limitAccesDoujin.indexOf(req.ip) != -1) return res.send({status: 'error', message: 'Spam!'})
    const doujinCode = req.params.id
    const codeDoujinFile = GenerateSerialNumber("0000000000000000000")
    const waktudel = Math.floor(1)
    const waktudelnya = waktudel+'h'
   //await _limitAccesDoujin.push(req.ip)
    //await fs.writeFileSync('./lib/database/web/limitacces.json', JSON.stringify(_limitAccesDoujin))

    try {
        await fs.mkdirSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}`)
        const nhentaiData = await NhenApi.fetchDoujin(Math.floor(doujinCode))
        if(nhentaiData == null) return res.send({status: 'error', message: 'Not Found!'})
        const listPageUrlNhentai = nhentaiData.pages
            if(nhentaiData.raw.num_pages <= 34) {
                console.log('<34')
                let promises = []
                function downloadNhentaiImage (i) {
                    return new Promise(async (resolve) => {
                        const buffer =  await axios.get(listPageUrlNhentai[i].url, { responseType: 'arraybuffer' })
                        //console.log('resolve_download_image '+i)
                        resolve(fs.writeFileSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}/${i+1}.jpg`, buffer.data))
                    })
                }
                for (let i = 0; i < listPageUrlNhentai.length; i++) {
                    promises.push(downloadNhentaiImage(i))
                }
                Promise.all(promises)
                    .then(async () => {
                        console.log('Succes Download Nhentai')

                        var readFolder_convert0 = fs.readdirSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}`)
                        let readFolder_convert = []

                        for (let i = 0; i <  readFolder_convert0.length; i++) {
                            await readFolder_convert.push(`./lib/src/cache/doujin/tmp/${codeDoujinFile}/${readFolder_convert0[i]}`)
                        }
                        await readFolder_convert.sort((a, b) => (a.trim().split('/')[7].trim().split('.')[0] - b.trim().split('/')[7].trim().split('.')[0]))

                        //console.log(readFolder_convert)
                        const doc = new PDFDocument({autoFirstPage: false})
                        doc.pipe(fs.createWriteStream(`./lib/src/cache/doujin/${doujinCode}.pdf`))

                        for (let i = 0; i <  readFolder_convert.length; i++) {
                            var images = doc.openImage(readFolder_convert[i]);
                            await doc.addPage({size: [images.width, images.height]})
                            await doc.image(readFolder_convert[i], 0, 0);
                        }

                        await doc.end()
                        await addDelTime(`./lib/src/cache/doujin/${doujinCode}.pdf`, waktudelnya)
                        await res.send({ file:`https://dwiqi.my.id/lib/src/cache/doujin/${doujinCode}.pdf`, data: nhentaiData})

                        await sleep(5000)
                        fs.removeSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}`)
                    })
                    console.log('succes')
            } else {
                console.log('big')
                await nhzipdl(doujinCode).then(async (buffer) => {
                    await fs.writeFileSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}.zip`, buffer);
                });
                console.log('succes download')

                await fs.createReadStream(`./lib/src/cache/doujin/tmp/${codeDoujinFile}.zip`)
                    .pipe(unzipper.Extract({ path: `./lib/src/cache/doujin/tmp/${codeDoujinFile}` }))
                    .on('finish', async () => {
                        console.log('succes unzip')

                        var readFolder_convert0 = fs.readdirSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}`)
                        let readFolder_convert = []

                        for (let i = 0; i <  readFolder_convert0.length; i++) {
                            await readFolder_convert.push(`./lib/src/cache/doujin/tmp/${codeDoujinFile}/${readFolder_convert0[i]}`)
                        }
                        await readFolder_convert.sort((a, b) => (a.trim().split('/')[7].trim().split('.')[0] - b.trim().split('/')[7].trim().split('.')[0]))

                        console.log('succes readdir')
                        const doc = new PDFDocument({autoFirstPage: false})
                        doc.pipe(fs.createWriteStream(`./lib/src/cache/doujin/${doujinCode}.pdf`))

                        for (let i = 0; i <  readFolder_convert.length; i++) {
                            var images = doc.openImage(readFolder_convert[i]);
                            await doc.addPage({size: [images.width, images.height]})
                            await doc.image(readFolder_convert[i], 0, 0);
                        }

                        await doc.end()
                        await addDelTime(`./lib/src/cache/doujin/${doujinCode}.pdf`, waktudelnya)
                        await res.send({ file:`https://dwiqi.my.id/lib/src/cache/doujin/${doujinCode}.pdf`, data: nhentaiData})

                        await sleep(5000)
                        fs.removeSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}`)
                        fs.unlinkSync(`./lib/src/cache/doujin/tmp/${codeDoujinFile}.zip`)

                        console.log('success')
                    })
            }
    } catch (err) {
        console.error(err)
        //const delPositionAcces = _limitAccesDoujin.indexOf(req.ip)
        //await _limitAccesDoujin.splice(delPositionAcces, 1)
        //await fs.writeFileSync('./lib/database/web/limitacces.json', JSON.stringify(_limitAccesDoujin))
    }
//const delPositionAcces = _limitAccesDoujin.indexOf(req.ip)
    //await _limitAccesDoujin.splice(delPositionAcces, 1)
    //await fs.writeFileSync('./lib/database/web/limitacces.json', JSON.stringify(_limitAccesDoujin))
})

router.get('/root/Mizu', (req, res) => {
    return res.redirect('https://youtu.be/X3B0ZjB13Xw')
})
    //JSON
router.get('/api/doujin', (req, res) => {
    if(req.query.id == null) return res.send({status: 'error', message: 'missing id'})
    const doujinCode = req.query.id
})

router.get('/api/groupmessagecount', (req, res) => {
    res.sendFile(__dirname + '/lib/database/group/count.json')
})

router.get('/api/investjum', (req, res) => {
    res.sendFile(__dirname + '/lib/database/user/invest.json')
})

router.get('/api/leaderboard', (req, res) => {
    res.sendFile(__dirname + '/lib/database/user/level.json')
});

router.get('/api/leaderboardmoney', (req, res) => {
    res.sendFile(__dirname + '/lib/database/user/money.json')
});

router.get('/file/dwn07797', (req, res) => {
    res.download("C:/Users/Administrator/Downloads/Otakudesu_OverLord_480p.rar", 'Otakudesu_OverLord_480p.rar')
});

router.post('/api/simsimi', async (req, res) => {
    if(req?.body?.tx == undefined) return res.status(400).send({ err: true, msg: 'missing tx parameter' })
    if(req?.body?.lc == undefined) return res.status(400).send({ err: true, msg: 'missing lc parameter' })
    console.log(req.body.tx)

    const requestSimSimi = await axios.get(`https://simsimi.info/api/?text=${req.body.tx}&lc=${req.body.lc}`)
    return res.send({ err: false, msg: requestSimSimi.data })
})

router.get('/gclinkinfo', (req, res) => {
    return res.redirect('https://chat.whatsapp.com/IDInULDM0I80sLpRaVnIkm')
})

router.post('/webhook/github', async (req, res) => {
    console.log('github webhook', req.body)

    res.send({ status: true })

    try {
        await axios.post('http://localhost:7517/webhook/github', req.body)
    } catch (err) {
        console.log(err)
    }
})

router.post('/webhook/test4691', async (req, res) => {
    console.log('test4691 webhook post', req.body)
    return res.send({ status: true })
})
router.get('/webhook/test4691', async (req, res) => {
    console.log('test4691 webhook get', req.query)
    return res.send({ status: true })
})

router.get('/beautify', (req, res) => {
    if(req.query.path == undefined) return res.send({ status: false })

    if(!fs.existsSync(req.query.path)) return res.send({ status: false, msg: 'file not exists!' })
    try {
        return res.send(JSON.stringify(JSON.parse(fs.readFileSync(req.query.path)), null, 2))
    } catch (err) {
        console.log(err)
        return res.send({ status: false, msg: 'failed format json' })
    }
})

app.use('/', router);

app.set('port', (3000))
app.listen(app.get('port'), () => {
    console.log('App Started on PORT', app.get('port'));
})