// const carDatabase = {
//     "car01": {
//         id: "car01",
//         name: "Icikiwir",
//         price: 100_000_000,
//         available: false,
//         stats: {
//             maxSpeed: 200,
//             acceleration: 10,
//             maxGear: 6
// 
//         }
//     },
//     "dwicar-experimentx17": {
//         id: "dwicar-experimentx17",
//         name: "Dwicar Experiment X17",
//         price: 0,
//         available: false, // Mobil ini tidak bisa dibeli
//         stats: {
//             maxSpeed: 999999,
//             acceleration: 999999,
//             maxGear: 8
//         }
//     },
//     "Ichikiwir_V2": {
//         id: "Ichikiwir_V2",
//         name: "Ichikiwir V2",
//         price: 9.9e299,
//         available: false,
//         stats: {
//             maxSpeed: 46782872,
//             acceleration: 99999999,
//             maxGear: 6
//         }
//     },
//     "Vbazz": {
//         id: "Vbazz",
//         name: "Vbazz",
//         price: 1e195,
//         stats: {
//             maxSpeed: 340,
//             acceleration: 19.5,
//             maxGear: 6
//         }
//     },
//     "H3R_Man": {
//         id: "H3R_Man",
//         name: "H3R-Man",
//         price: 1e120,
//         stats: {
//             maxSpeed: 289,
//             acceleration: 17.9,
//             maxGear: 6
//         }
//     },
//     "H3_RYU": {
//         id: "H3_RYU",
//         name: "H3-RYU",
//         price: 7e145,
//         stats: {
//             maxSpeed: 267,
//             acceleration: 16,
//             maxGear: 6
//         }
//     },
//     "SU_3TM0M0": {
//         id: "SU_3TM0M0",
//         name: "SU-3TM0M0",
//         price: 2e87,
//         stats: {
//             maxSpeed: 233,
//             acceleration: 14.8,
//             maxGear: 6
//         }
//     },
//     "TDR_3K": {
//         id: "TDR_3K",
//         name: "TDR-3K",
//         price: 7e71,
//         stats: {
//             maxSpeed: 219,
//             acceleration: 13,
//             maxGear: 6
//         }
//     },
//     "G_M300": {
//         id: "G_M300",
//         name: "G-M300",
//         price: 6e63,
//         stats: {
//             maxSpeed: 208,
//             acceleration: 11,
//             maxGear: 6
//         }
//     },
//     "P_JRPRO": {
//         id: "P_JRPRO",
//         name: "P-JRPRO",
//         price: 5e58,
//         stats: {
//             maxSpeed: 199,
//             acceleration: 9.9,
//             maxGear: 6
//         }
//     },
//     "A_Vnza": {
//         id: "A_Vnza",
//         name: "A-Vnza",
//         price: 1e36,
//         stats: {
//             maxSpeed: 174,
//             acceleration: 8.4,
//             maxGear: 6
//         }
//     },
//     "G_RR": {
//         id: "G_RR",
//         name: "G-RR",
//         price: 3e29,
//         stats: {
//             maxSpeed: 156,
//             acceleration: 7.9,
//             maxGear: 6
//         }
//     },
//     "V3_RR": {
//         id: "V3_RR",
//         name: "V3 RR",
//         price: 9e15,
//         stats: {
//             maxSpeed: 129,
//             acceleration: 6.7,
//             maxGear: 6
//         }
//     },
//     "V2_RR": {
//         id: "V2_RR",
//         name: "V2 RR",
//         price: 8.599e14,
//         stats: {
//             maxSpeed: 127,
//             acceleration: 6.69,
//             maxGear: 5
//         }
//     },
//     "V1_RR": {
//         id: "V1_RR",
//         name: "V1 RR",
//         price: 8e14,
//         stats: {
//             maxSpeed: 125,
//             acceleration: 6.5,
//             maxGear: 5
//         }
//     },
//     "Ichikiwir_V1": {
//         id: "Ichikiwir_V1",
//         name: "Ichikiwir V1",
//         price: 5e13,
//         stats: {
//             maxSpeed: 109,
//             acceleration: 5,
//             maxGear: 5
//         }
//     }
// }

const carDatabase = {
    "car01": {
        id: "car01",
        name: "Icikiwir",
        weight: 1500,
        accelerateRate: 20,
        maxSpeed: 280,
        maxGear: 6,
        gearRatio: [3.5, 2.5, 1.8, 1.4, 1.0, 0.8],
        minRpmPerGear: [1000, 1500, 2000, 2500, 3000, 3500],
        maxRpmPerGear: [2000, 2500, 3000, 3500, 4000, 4500],
        friction: 0.8,
        horsePowerCurve: [100, 200, 300, 400, 500, 600],
        torqueCurve: [200, 300, 400, 500, 600, 700],
        price: 100_000_000
    },

//     "car02": {
//         id: "car02",
//         name: "Car 02",
//         weight: 1470,
//         accelerateRate: 18,
//         maxSpeed: 260,
//         maxGear: 6,
//         gearRatio: [3.6, 2.6, 1.9, 1.5, 1.1, 0.9],
//         minRpmPerGear: [1100, 1600, 2100, 2600, 3100, 3600],
//         maxRpmPerGear: [2100, 2600, 3100, 3600, 4100, 4600],
//         friction: 0.75,
//         horsePowerCurve: [90, 180, 270, 360, 450, 540],
//         torqueCurve: [190, 290, 390, 490, 590, 690],
//         price: 120_000_000
//     },
    
//     "car03": {
//         id: "car03",
//         name: "Car 03",
//         weight: 1450,
//         accelerateRate: 16,
//         maxSpeed: 300,
//         maxGear: 6,
//         gearRatio: [3.7, 2.7, 2.0, 1.6, 1.2, 1.0],
//         minRpmPerGear: [1200, 1700, 2200, 2700, 3200, 3700],
//         maxRpmPerGear: [2200, 2700, 3200, 3700, 4200, 4700],
//         friction: 0.7,
//         horsePowerCurve: [85, 170, 255, 340, 425, 510],
//         torqueCurve: [180, 280, 380, 480, 580, 680],
//         price: 140_000_000
//     },
    
//    "car04": {
//         id: "car04",
//         name: "Car 04",
//         weight: 1400,
//         accelerateRate: 15,
//         maxSpeed: 320,
//         maxGear: 6,
//         gearRatio: [3.8, 2.8, 2.1, 1.7, 1.3, 1.05],
//         minRpmPerGear: [1300, 1800, 2300, 2800, 3300, 3800],
//         maxRpmPerGear: [2300, 2800, 3300, 3800, 4300, 4800],
//         friction: 0.65,
//         horsePowerCurve: [80, 160, 240, 320, 400, 480],
//         torqueCurve: [170, 270, 370, 470, 570, 670],
//         price: 160_000_000
//     },
    
//     "car05": {
//         id: "car05",
//         name: "Car 05",
//         weight: 1370,
//         accelerateRate: 13,
//         maxSpeed: 350,
//         maxGear: 6,
//         gearRatio: [3.9, 2.9, 2.2, 1.8, 1.4, 1.1],
//         minRpmPerGear: [1400, 1900, 2400, 2900, 3400, 3900],
//         maxRpmPerGear: [2400, 2900, 3400, 3900, 4400, 4900],
//         friction: 0.6,
//         horsePowerCurve: [75, 150, 225, 300, 375, 450],
//         torqueCurve: [160, 260, 360, 460, 560, 660],
//         price: 180_000_000
//     }
}
module.exports = carDatabase;