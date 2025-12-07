"use strict";
const WAProto_1 = require("baileys/WAProto");
const auth_utils_1 = require("baileys/lib/Utils/auth-utils");
const generics_1 = require("baileys/lib/Utils/generics"); 
const useMongoDBAuthState = async (collection) => {

    const writeData = (data, id) => {
        console.log('writeData', data, id, generics_1.BufferJSON.replacer)
        return collection.replaceOne({iId: id}, Object.assign({ iId: id }, JSON.parse(JSON.stringify(data, generics_1.BufferJSON.replacer))), {upsert: true}).exec()
    };
    const readData = async (id) => {
        try {
            const data = JSON.stringify(await collection.findOne({iId: id}));
            return JSON.parse(data, generics_1.BufferJSON.reviver);
        }
        catch (error) {
            return null;
        }
    };
    const removeData = async (id) => {
        try {
            await collection.deleteOne({iId: id});
        }
        catch (_a) {
        }
    };
    const creds = await readData('creds') || (0, auth_utils_1.initAuthCreds)();
    console.log('creds', creds)
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key') {
                            value =WAProto_1.proto.AppStateSyncKeyData.fromObject(data);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const id = `${category}-${id}`;
                            tasks.push(value ? writeData(value, id) : removeData(id));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        }
    };
};
exports.useMongoDBAuthState = useMongoDBAuthState;