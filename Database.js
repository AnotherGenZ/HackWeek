const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const modelPath = path.join(__dirname, 'models');

class DB {
    constructor(dbURL) {
        this._models = {};

        console.log('Connecting to mongodb...');

        mongoose.connect(dbURL, {
            poolSize: 5,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            keepAlive: 120,
            connectTimeoutMS: 30000,
            useNewUrlParser: true
        });

        const connection = mongoose.connection;

        connection.on('error', console.error);
        connection.once('open', () => console.log('Connected to mongo.'));

        fs
            .readdirSync(modelPath)
            .forEach(file => {
                const model = require(path.join(modelPath, file));
                this._models[model.modelName] = model;
            });
    }
}

module.exports = DB;