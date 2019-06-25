const Eris = require('eris');
const DB = require('./Database');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const bot = new Eris(process.env.TOKEN);
const db = new DB(process.env.DB);

const proxy = new Proxy(db, {
    get: (target, prop, receiver) => {
        return target._models[prop];
    }
});

bot.on('ready', () => {
    console.log('Git ready to log!');
});

fs.readdir(path.join(__dirname, 'events'), (err, files) => {
    if (err) {
        return console.log(err);
    } else {
        for (let file of files) {
            let eventName = file.split('.')[0];
            let handler = require(path.join(__dirname, 'events', file));

            bot.on(eventName, (...params) => {
                handler(bot, proxy, ...params);
            });
        }
    }
});

bot.connect();