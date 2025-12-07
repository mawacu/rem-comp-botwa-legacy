// const { _mongo_CommandSchema, _mongo_InvestHistorySchema } = require('./lib/dbtype')(false)
// import { _mongo_CommandSchema, _mongo_InvestHistorySchema } from '../dbtype.js'
import pkg from '../dbtype.js'
const { _mongo_CommandSchema, _mongo_InvestHistorySchema } = pkg
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import 'chartjs-chart-financial'
import luxon from 'luxon'

class CryptoMarketSimulator {
    constructor(coin, dataCoin) {
        const { initialPrice, adjustmentRatio, initialSupply, maxSupply } = dataCoin;

        this.coin = coin;
        this.initialPrice = initialPrice;
        this.adjustmentRatio = adjustmentRatio;
        this.currentPrice = initialPrice;
        this.circulatingSupply = initialSupply;
        this.maxSupply = maxSupply;
        this.marketCap = initialPrice * initialSupply;
        this.totalVolume = 0;
        this.transactionHistory = [];
        this.priceHistory = [];
    }

    updatePrice(transaction) {
        const { type, content } = transaction;
        console.log('updatePrice', type, content)
        if (type === "buy") {
            this.currentPrice *= (1 + this.adjustmentRatio * content / (this.circulatingSupply + content));
        } else if (type === "sell") {
            this.currentPrice *= (1 - this.adjustmentRatio * content / (this.circulatingSupply - content));
        }
        this.currentPrice = Math.max(0, this.currentPrice); // Ensure price doesn't go negative
        console.log('updatePrice_current', this.currentPrice)
    }

    async updateMetrics(transaction) {
        this.circulatingSupply = Math.min(this.maxSupply, this.circulatingSupply + transaction.content);
        this.marketCap = this.currentPrice * this.circulatingSupply;
        this.totalVolume += transaction.content;
        await _mongo_CommandSchema.updateOne({ cId: 'invest_price' }, { $set: { [`invest.${this.coin}.currentPrice`]: this.currentPrice, [`invest.${this.coin}.circulatingSupply`]: this.circulatingSupply, [`invest.${this.coin}.marketCap`]: this.marketCap, [`invest.${this.coin}.totalVolume`]: this.totalVolume } })
        await _mongo_InvestHistorySchema.create({
            coin: this.coin,
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            date: transaction.date,
            type: transaction.type,
            content: transaction.content,
            price: this.currentPrice
        })
    }

    async calculateSMA(period) {
        const filteredPriceHistory = await _mongo_InvestHistorySchema.find({ coin: this.coin, date: { $gt: Date.now() - period } }).sort({ date: -1 })
        if (filteredPriceHistory.length < period) return null;
        const sum = filteredPriceHistory.reduce((a, b) => a + b, 0);
        return sum / period;
    }

    async calculateVolatility(period) {
        // use mongodb to filter the date
        const filteredPriceHistory = await _mongo_InvestHistorySchema.find({ coin: this.coin, date: { $gt: Date.now() - period } }).sort({ date: -1 })
        if (filteredPriceHistory.length < period) return null;
        const mean = filteredPriceHistory.reduce((a, b) => a + b, 0) / period;
        const squaredDiffs = filteredPriceHistory.map(price => Math.pow(price - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
        return Math.sqrt(variance);
    }

    async calculateWAP() {
        // filter by coin
        const totalValue = await _mongo_InvestHistorySchema.aggregate([
            { $match: { coin: this.coin } },
            { $group: { _id: null, totalValue: { $sum: { $multiply: ["$price", "$content"] } }, totalVolume: { $sum: "$content" } } }
        ])
        return totalValue.totalValue / totalValue.totalVolume;
    }

    // give me the list open low high close from the price history in 3 hours with 10 minutes interval
    async calculateOHLC(intervalMinutes = 10, totalHours = 3) {
        const startTime = Date.now() - (totalHours * 60 * 60 * 1000);
        console.log({
            coin: this.coin,
            date: { $gt: startTime }
        })
        const priceHistory = await _mongo_InvestHistorySchema.find({
            coin: this.coin,
            date: { $gt: startTime }
        }).sort({ date: 1 }); // Ensure sorted by date in ascending order
    
        console.log('priceHistory', priceHistory.length)
        if (!priceHistory.length) return null;
    
        const ohlc = [];
        let intervalData = [];
        let intervalStart = priceHistory[0].date;
    
        priceHistory.forEach((dataPoint, index) => {
            console.log('dataPoint', index)
            if (dataPoint.date < intervalStart + intervalMinutes * 60 * 1000) {
                intervalData.push(dataPoint.price);
            } else {
                if (intervalData.length > 0) {
                    ohlc.push({
                        open: intervalData[0],
                        low: Math.min(...intervalData),
                        high: Math.max(...intervalData),
                        close: intervalData[intervalData.length - 1]
                    });
                }
                intervalData = [dataPoint.price];
                intervalStart = dataPoint.date;
            }
        });
    
        // Handle the last interval
        if (intervalData.length > 0) {
            console.log('intervalData')
            ohlc.push({
                open: intervalData[0],
                low: Math.min(...intervalData),
                high: Math.max(...intervalData),
                close: intervalData[intervalData.length - 1]
            });
        }
    
        return ohlc;
    }

    // New method to generate candlestick chart
    async generateCandlestickChart() {
        const ohlcData = await this.calculateOHLC();
        if (!ohlcData) {
            console.log('Not enough data to generate chart');
            return null;
        }

        const width = 800;  // Define the width of the chart
        const height = 600;  // Define the height of the chart

        const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width,
            height,
            plugins: {
                modern: ['chartjs-chart-financial'],
                globalVariableLegacy: ['chartjs-adapter-luxon']
            },
            chartCallback: (ChartJS) => {
                global.window = global.window || {};
                global.window.luxon = luxon;
            }
        });

        const configuration = {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: `${this.coin} Price History`,
                    data: ohlcData.map(({ open, high, low, close }, index) => ({
                        x: DateTime.now().minus({ minutes: index * 10 }).toJSDate(),
                        o: open,
                        h: high,
                        l: low,
                        c: close
                    }))
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'HH:mm'
                        }
                    }
                }
            }
        };

        try {
            const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
            console.log('Candlestick chart generated successfully.');
            return imageBuffer;
        } catch (error) {
            console.error('Error generating candlestick chart:', error);
            return null;
        }
    }

    // example of transaction
    // const transaction = {
    //     hash: 'XXX',
    //     from: 'XXX',
    //     to: 'XXX',
    //     date: Date.now(),
    //     type: 'buy',
    //     content: 100,
    // }
    async processTransaction(transaction) {
        this.updatePrice(transaction);
        await this.updateMetrics(transaction);

        return {
            currentPrice: this.currentPrice,
            marketCap: this.marketCap,
            circulatingSupply: this.circulatingSupply,
            totalVolume: this.totalVolume
        };
    }
}

// const listCoin = [
//     {
//         coin: 'naocoin',
//         dataCoin: {
//             initialPrice: 900_000,
//             adjustmentRatio: 0.1,
//             initialSupply: 1_000,
//             maxSupply: 2_000_000
//         }
//     },
//     {
//         coin: 'elacoin',
//         dataCoin: {
//             initialPrice: 3_500_000,
//             adjustmentRatio: 0.05,
//             initialSupply: 1_000,
//             maxSupply: 5_000_000
//         }
//     },
//     {
//         coin: 'recoin',
//         dataCoin: {
//             initialPrice: 80_000_000,
//             adjustmentRatio: 0.15,
//             initialSupply: 1_000,
//             maxSupply: 1_000_000
//         }
//     }
// ]

let ObjectCoin = {}
async function loadCoin() {
    const getDataMongoListPrice = await _mongo_CommandSchema.findOne({ cId: 'invest_price' })
    const listCoin = Object.keys(getDataMongoListPrice.invest).map(coin => {
        return {
            coin: coin,
            dataCoin: getDataMongoListPrice.invest[coin]
        }
    })

    for(const { coin, dataCoin } of listCoin) {
        const simulator = new CryptoMarketSimulator(coin, dataCoin);
        console.log(simulator.currentPrice, simulator.marketCap, simulator.circulatingSupply, simulator.totalVolume);
        ObjectCoin[coin] = simulator;
    }
}
loadCoin()

const express = require('express');
const app = express();
const port = 5153;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/price/:coin', async (req, res) => {
    const { coin } = req.params;
    if (!ObjectCoin[coin]) {
        return res.status(404).json({ message: 'Coin not found' });
    }

    const { currentPrice, marketCap, circulatingSupply, totalVolume } = ObjectCoin[coin];
    const sma = await ObjectCoin[coin].calculateSMA(req.query.period);
    const volatility = await ObjectCoin[coin].calculateVolatility(req.query.period);
    const wap = await ObjectCoin[coin].calculateWAP();
    res.json({ currentPrice, marketCap, circulatingSupply, totalVolume, sma, volatility, wap });
});

app.get('/chart/:coin', async (req, res) => {
    const { coin } = req.params;
    if (!ObjectCoin[coin]) {
        return res.status(404).json({ message: 'Coin not found' });
    }

    const imageBuffer = await ObjectCoin[coin].generateCandlestickChart();
    if (!imageBuffer) {
        return res.status(500).json({ message: 'Failed to generate chart' });
    }

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
});

app.post('/transaction/:coin', async (req, res) => {
    console.log('transaction')
    const { coin } = req.params;
    if (!ObjectCoin[coin]) {
        console.log('Coin not found')
        return res.status(404).json({ message: 'Coin not found' });
    }

    const { hash, from, to, date, type, content } = req.body;
    if (!hash || !from || !to || !date || !type || !content) {
        console.log('Missing required fields')
        return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('transaction', hash, from, to, date, type, content)
    const transaction = { hash, from, to, date, type, content };
    const result = await ObjectCoin[coin].processTransaction(transaction);
    res.json(result);
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});