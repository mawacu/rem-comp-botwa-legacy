const cron = require('node-cron');
const moment = require('moment-timezone')
const fs = require('fs')
moment.tz.setDefault('Asia/Jakarta').locale('id')

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const canvasRenderService1 = new ChartJSNodeCanvas({ width: 1920, height: 1080 });

const { _mongo_BotSchema} = require('./lib/dbtype')(false)
const { numberWithCommas2, } = require('./lib/functions')(false)

cron.schedule("*/1 * * * *", async function () {
    try {
        const _botDb = await  _mongo_BotSchema.findOne({ iId: 'CORE' })
        var _invest = _botDb.invest

        // const minMaxValueCoal = [1_999, 9_999]
        // const randomMinMaxCoal = [Math.floor(Math.random() * 70) + 40, Math.floor(Math.random() * 100) + 120]

        // const minMaxValueCopper = [10_000, 15_999]
        // const randomMinMaxCopper = [Math.floor(Math.random() * 90) + 120, Math.floor(Math.random() * 50) + 230]

        const minMaxValueIron = [900_000, 4_500_000]
        // [0] Decrease | [1] Increase
        const randomMinMaxIron = [Math.floor(Math.random() * 120_000) + 20_000, Math.floor(Math.random() * 115_000) + 35_000]

        const minMaxValueGold = [10_000_000, 34_000_000]
        // const minMaxValueGold = [150_000, 200_000]
        const randomMinMaxGold = [Math.floor(Math.random() * 950_000) + 250_000, Math.floor(Math.random() * 800_000) + 400_000]

        const minMaxValueDiamond = [189_000_000, 389_000_000]
        const randomMinMaxDiamond = [Math.floor(Math.random() * 8_799_999) + 1_200_000, Math.floor(Math.random() * 10_000_000) + 10_000_000]

        // const minMaxValueSaCoin = [409_000, 789_000]
        // const randomMinMaxSaCoin = [Math.floor(Math.random() * 10289) + 2500, Math.floor(Math.random() * 27000) + 7000]

        // const minMaxValueNaoCoin = [450_000, 850_000]
        // // const minMaxValueNaoCoin = [450_000, 700_000]
        // const randomMinMaxNaoCoin = [Math.floor(Math.random() * 2700) + 400, Math.floor(Math.random() * 2400) + 700]

        // const minMaxValueElaCoin = [1_300_000, 3_500_000]
        // // const minMaxValueElaCoin = [1_300_000, 3_000_000]
        // const randomMinMaxElaCoin = [Math.floor(Math.random() * 4000) + 500, Math.floor(Math.random() * 3600) + 900]

        // const minMaxValueReCoin = [70_500_000, 80_000_000]
        // // const minMaxValueReCoin = [70_000_000, 70_500_000]
        // const randomMinMaxReCoin = [Math.floor(Math.random() * 2000) + 3000, 5000]

        // const invsListPercent = { // digit
        //     "0": {
        //         buy: 0.5,
        //         sell: 0.5
        //     },
        //     "1": {
        //         buy: 0.05,
        //         sell: 0.05
        //     },
        //     "2": {
        //         buy: 0.005,
        //         sell: 0.005
        //     },
        //     "3": {
        //         buy: 0.0005,
        //         sell: 0.0005
        //     },
        //     "4": {
        //         buy: 0.00005,
        //         sell: 0.00005
        //     },
        //     "5": {
        //         buy: 0.000006,
        //         sell: 0.000006
        //     },
        //     "6": {
        //         buy: 0.0000006,
        //         sell: 0.0000006
        //     },
        //     "7": {
        //         buy: 0.00000006,
        //         sell: 0.00000006
        //     }
        // }
        // const invsList = _invest[2]

        // [0] data | [1] variable_name
        // const allCoin = [['coal', 'Coal'], ['copper', 'Copper'], ['iron', 'Iron'], ['gold', 'Gold'], ['diamond', 'Diamond'], ['sacoin', 'SaCoin'], ['naocoin', 'NaoCoin'], ['elacoin', 'ElaCoin'], ['recoin', 'ReCoin']]
        // const allCoin = [['iron', 'Iron'], ['gold', 'Gold'], ['diamond', 'Diamond'], ['naocoin', 'NaoCoin'], ['elacoin', 'ElaCoin'], ['recoin', 'ReCoin']]
        const allCoin = [['iron', 'Iron'], ['gold', 'Gold'], ['diamond', 'Diamond']]
        for(let i = 0; i < allCoin.length; i++) {
            const currentCoin = allCoin[i]
            console.log('Updating', currentCoin[1])
            const randomNaikTurunInvest = Math.floor(Math.random() * 2)
            
            const minMaxValue = eval(`minMaxValue${currentCoin[1]}`)
            const randomMinMax = eval(`randomMinMax${currentCoin[1]}`)
            
            // const invListValue = invsList[currentCoin[0]]
            // const digitInvCount = (Math.floor(_invest[0][currentCoin[0]] / 1000) || '').toString().length
            // const invPrice = invsListPercent[digitInvCount]
            // const buyIncrease = Math.floor((invListValue.buy * _invest[0][currentCoin[0]]) * invPrice.buy)
            // const sellDecrease = Math.floor((invListValue.sell * _invest[0][currentCoin[0]]) * invPrice.sell)
            
            // _invest[0][currentCoin[0]] = Math.floor(Math.abs(_invest[0][currentCoin[0]] + buyIncrease - sellDecrease))

            if (randomNaikTurunInvest == 0) { //Turun
                const minValue = Number(minMaxValue[0])
                if (Number(_invest[0][currentCoin[0]]) <= minValue) { //Paksa Naik
                    _invest[0][currentCoin[0]] = Math.floor(_invest[0][currentCoin[0]] + randomMinMax[1])
                } else {
                    _invest[0][currentCoin[0]] = Math.abs(_invest[0][currentCoin[0]] - randomMinMax[0])
                }
            } else if (randomNaikTurunInvest == 1) {
                const maxValue = Number(minMaxValue[1])
                if (Number(_invest[0][currentCoin[0]]) >= maxValue) { //Paksa Turun
                    _invest[0][currentCoin[0]] = Math.abs(_invest[0][currentCoin[0]] - randomMinMax[0])
                } else {
                    _invest[0][currentCoin[0]] = Math.floor(_invest[0][currentCoin[0]] + randomMinMax[1])
                }
            }

            _invest[1][`re_${currentCoin[0]}0`] = _invest[1][`re_${currentCoin[0]}1`]
            _invest[1][`re_${currentCoin[0]}1`] = _invest[1][`re_${currentCoin[0]}2`]
            _invest[1][`re_${currentCoin[0]}2`] = _invest[1][`re_${currentCoin[0]}3`]
            _invest[1][`re_${currentCoin[0]}3`] = _invest[1][`re_${currentCoin[0]}4`]
            _invest[1][`re_${currentCoin[0]}4`] = _invest[1][`re_${currentCoin[0]}5`]
            _invest[1][`re_${currentCoin[0]}5`] = _invest[1][`re_${currentCoin[0]}6`]
            _invest[1][`re_${currentCoin[0]}6`] = _invest[1][`re_${currentCoin[0]}7`]
            _invest[1][`re_${currentCoin[0]}7`] = _invest[1][`re_${currentCoin[0]}8`]
            _invest[1][`re_${currentCoin[0]}8`] = _invest[1][`re_${currentCoin[0]}9`]
            _invest[1][`re_${currentCoin[0]}9`] = _invest[0][currentCoin[0]]
            _invest[2][currentCoin[0]] = { buy: 0, sell: 0 }
        }
        await _mongo_BotSchema.updateOne({ iId: 'CORE' }, { $set: { invest: _invest } })
    
        const re0_diamond = _invest[1].re_diamond0
        const re1_diamond = _invest[1].re_diamond1
        const re2_diamond = _invest[1].re_diamond2
        const re3_diamond = _invest[1].re_diamond3
        const re4_diamond = _invest[1].re_diamond4
        const re5_diamond = _invest[1].re_diamond5
        const re6_diamond = _invest[1].re_diamond6
        const re7_diamond = _invest[1].re_diamond7
        const re8_diamond = _invest[1].re_diamond8
        const re9_diamond = _invest[1].re_diamond9
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
                            label: 'Diamond',
                            //backgroundColor: 'rgba(255,0,0,0.2)',
                            backgroundColor: 'rgb(154, 197, 219)',
                            borderColor: 'rgba(154, 197, 219, 2)',
                            data: [re0_diamond, re1_diamond, re2_diamond, re3_diamond, re4_diamond, re5_diamond, re6_diamond, re7_diamond, re8_diamond, re9_diamond]
                        },
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
    } catch (error) {
        console.log(error);
    }
});