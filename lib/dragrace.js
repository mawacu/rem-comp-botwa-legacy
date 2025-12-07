const { textProgressBar } = require('./functions')(false)

const REFRESH_TIME = 50; // Refresh time in milliseconds
const RPMSTART = 1000; // Starting RPM

class DragRaceMechanic {
    constructor(weight, accelerateRate, maxSpeed, maxGear, gearRatio, minRpmPerGear, maxRpmPerGear, friction, distance, horsepowerCurve, torqueCurve) {
        this.weight = weight;       // Weight of the car
        this.accelerateRate = accelerateRate;   // Rate of acceleration (adjusted for balance)
        this.maxSpeed = maxSpeed;        // Maximum speed in km/h (approximately 175 mph)
        this.maxGear = maxGear;           // Maximum gear (adjusted for balance)
        this.gearRatio = gearRatio;  // Adjusted gear ratios for balance
        this.minRpmPerGear = minRpmPerGear; // Minimum RPM per gear (adjusted for balance)
        this.maxRpmPerGear = maxRpmPerGear; // Maximum RPM per gear (adjusted for balance)
        this.friction = friction;        // Friction
        this.refreshTime = REFRESH_TIME;      // Refresh time in milliseconds
        this.currentSpeed = 0;      // Current speed
        this.currentGear = 1;       // Current gear
        this.rpm = RPMSTART;               // Revolutions per minute
        this.mileage = 0;           // Car's mileage in meters
        this.maxMileage = distance;     // Maximum mileage in meters
        this.horsepowerCurve = horsepowerCurve; // Adjusted horsepower curve for balance
        this.torqueCurve = torqueCurve;      // Torque per gear at max RPM (unchanged)
    }

    // Function to calculate horsepower based on RPM and current gear
    calculateHorsepower() {
        let maxRpm = this.maxRpmPerGear[this.currentGear - 1];
        let minRpm = this.minRpmPerGear[this.currentGear - 1];
        let percentOfMaxRpm = (this.rpm - minRpm) / (maxRpm - minRpm);
        return this.horsepowerCurve[this.currentGear - 1] * percentOfMaxRpm;
    }

    // Function to calculate torque based on RPM and current gear
    calculateTorque() {
        let maxRpm = this.maxRpmPerGear[this.currentGear - 1];
        let minRpm = this.minRpmPerGear[this.currentGear - 1];
        let percentOfMaxRpm = (this.rpm - minRpm) / (maxRpm - minRpm);
        return this.torqueCurve[this.currentGear - 1] * percentOfMaxRpm;
    }

    // Function to accelerate
    accelerate() {
        if ((this.currentGear < this.maxGear) && (this.rpm >= this.maxRpmPerGear[this.currentGear - 1])) {
            this.shiftUp();
        }
        if ((this.currentGear > 1) && (this.rpm <= this.minRpmPerGear[this.currentGear - 2])) {
            this.shiftDown();
        }
        
        // Increment rpm gradually until it reaches the minimum rpm of the current gear
        if(this.currentSpeed < this.maxSpeed) {
            let currentGearRatio = this.gearRatio[this.currentGear - 1];
            // Adjust accelerateRate based on weight
            let adjustedAccelerateRate = this.accelerateRate / (this.weight / 1000);
            let acceleration = adjustedAccelerateRate * currentGearRatio - this.friction;
            this.currentSpeed += (this.rpm >= this.maxRpmPerGear[this.currentGear - 1]) ? 0 : ((acceleration * this.refreshTime / 1000) * 3600 / 1000); // Convert to km/h
            if (this.currentSpeed > this.maxSpeed) {
                this.currentSpeed = this.maxSpeed;
            }
            this.rpm += (this.maxRpmPerGear[this.currentGear - 1] - this.minRpmPerGear[this.currentGear - 1]) * (this.refreshTime / 1000);
        }
        if (this.rpm > this.maxRpmPerGear[this.currentGear - 1]) {
            this.rpm = this.maxRpmPerGear[this.currentGear - 1];
        }
        
        // Update mileage
        this.mileage += (this.currentSpeed * this.refreshTime / 1000);
    }

    // Function to shift gear up
    shiftUp() {
        if (this.currentGear < this.maxGear && this.rpm >= this.maxRpmPerGear[this.currentGear - 1]) {
            this.rpm = this.maxRpmPerGear[this.currentGear - 1] * 0.9; // RPM drops to 90% of the maximum RPM of the current gear
            this.currentGear++;
        }
    }

    // Function to shift gear down
    shiftDown() {
        if (this.currentGear > 1 && this.rpm <= this.minRpmPerGear[this.currentGear - 2]) {
            this.currentGear--;
        }
    }

    // Function to display current speed, gear, rpm, horsepower, torque, and mileage
    displayStats(isJson = false) {
        let horsepower = this.calculateHorsepower();
        let torque = this.calculateTorque();
        const getRpmBar = textProgressBar(this.rpm, this.maxRpmPerGear[this.currentGear - 1], 10, false);
        if(isJson) {
            return {
                currentSpeed: this.currentSpeed.toFixed(2),
                currentGear: this.currentGear,
                rpm: this.rpm.toFixed(2),
                horsepower: horsepower.toFixed(2),
                torque: torque.toFixed(2),
                mileage: this.mileage.toFixed(2),
                rpmBar: getRpmBar
            }
        } else {
            return `Speed : ${this.currentSpeed.toFixed(2)} km/h
RPM : ${getRpmBar}
Gear : ${this.currentGear} / ${this.maxGear}
Distance : ` + '`' + `${this.mileage.toFixed(2)} m` + '`'
        }
    }

    // Function to check if race is finished
    isRaceFinished() {
        return this.mileage >= this.maxMileage;
    }
}

// Example usage:
// let dragRaceCar = new DragRaceMechanic(1400); // Adjusted weight of the car for balance (kg)
// let interval = setInterval(() => {
//     dragRaceCar.accelerate();
//     dragRaceCar.displayStats();
//     if (dragRaceCar.isRaceFinished()) {
//         clearInterval(interval);
//         console.log("Race finished!");
//     }
// }, dragRaceCar.refreshTime);

const carDatabase = require('./database/mobil')
async function dragRaceRun(rem, _raceDb, longDistance) {
    let textReturnCarRaceStart_countdown = `Player :`
    _raceDb.listUser.forEach((user) => {
        textReturnCarRaceStart_countdown += `\n- @${user.id.replace('@s.whatsapp.net', '')}`
    })
    const editMessageRaceStart = await rem.sendText(from, textReturnCarRaceStart_countdown + `\n\n*Pada detik ke 0, Reply pesan ini dan kirim 1, untuk gas pol*`)
    for(let i = 4; i > -1; i--) {
        textReturnCarRaceStart_countdown += `\n*${i}...*`

        let textSendEditRaceStartAct = textReturnCarRaceStart_countdown + `\n\n*Pada detik ke 0, Reply pesan ini dan kirim 1, untuk gas pol*`
        if(i === 0) textSendEditRaceStartAct = await rem.sendButtons(from, textReturnCarRaceStart_countdown + `\n\n*Pada detik ke 0, Reply pesan ini dan kirim 1, untuk gas pol*`, [{ id: `${prefix}raceact racestart ${randomIdRaceStart}`, text: 'Gas Poll!!' }], '', '', {}, {}, true)

        await sleep(1000)
        await rem.sendEditMessage(from, editMessageRaceStart.key, textSendEditRaceStartAct, { mentions: _raceDb.listUser.map(user => user.id) })
        if(i === 0) startRace()
    }

    async function startRace() {
        let storageRace = []

        for(let i = 0; i < _raceDb.listUser.length; i++) {
            let user = _raceDb.listUser[i]
            let car = carDatabase[user.car]
            let dragRaceCar = new DragRaceMechanic(car.weight, car.accelerateRate, car.maxSpeed, car.maxGear, car.gearRatio, car.minRpmPerGear, car.maxRpmPerGear, car.friction, longDistance, car.horsepowerCurve, car.torqueCurve)
            storageRace.push({ user, dragRaceCar })
        }

        let textSendRaceStart = storageRace.map(({ user, dragRaceCar }) => `*${user.name} _(${carDatabase[user.car]})_*\n${dragRaceCar.displayStats()}`).join('\n\n             - VS -\n\n')
        const sendEditMessage = await rem.sendText(from, textSendRaceStart)

        let loopRace = 1
        let readRaceStart = await _mongo_CommandSchema.findOne({ cId: 'racestart', 'content.id': Number(_raceDb.id) }, { 'content.$': 1 })
        for(let i = 0; i < loopRace; i++) {
            await sleep(REFRESH_TIME)

            if(i % 2 === 0) readRaceStart = await _mongo_CommandSchema.findOne({ cId: 'racestart', 'content.id': Number(_raceDb.id) }, { 'content.$': 1 })

            let isRaceFinished = false
            for(let i = 0; i < storageRace.length; i++) {
                let { user, dragRaceCar } = storageRace[i]
                if(!readRaceStart.content[0].startUser?.includes(user.id)) continue

                dragRaceCar.accelerate()
                if(dragRaceCar.isRaceFinished()) {
                    isRaceFinished = true
                    clearInterval(interval)
                    await rem.sendTextWithMentions(from, `@${user.id.replace('@s.whatsapp.net', '')} telah memenangkan balapan`)
                    break
                }
            }

            // jika kelipatan 40
            if(i % 40 === 0) {
                textSendRaceStart = storageRace.map(({ user, dragRaceCar }) => `*${user.name} _(${carDatabase[user.car]})_*\n${dragRaceCar.displayStats()}`).join('\n\n             - VS -\n\n')
                await rem.sendEditMessage(from, sendEditMessage.key, textSendRaceStart)
            }

            if(isRaceFinished) {
                clearInterval(interval)
                textSendRaceStart = storageRace.map(({ user, dragRaceCar }) => `*${user.name} _(${carDatabase[user.car]})_*\n${dragRaceCar.displayStats()}`).join('\n\n             - VS -\n\n')
                await rem.sendEditMessage(from, sendEditMessage.key, textSendRaceStart)
                await rem.sendText(from, `Balapan selesai!`)
            }
        }
    }
}

module.exports = { DragRaceMechanic, dragRaceRun };
