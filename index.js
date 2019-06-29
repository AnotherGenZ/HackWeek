const Eris = require('eris');
const DB = require('./Database');
const fs = require('fs');
const path = require('path');
const { cleanGuild, cleanChannel, cleanRole } = require('./utils');
const { v4: uuid } = require('uuid')

require('dotenv').config();

const bot = new Eris(process.env.TOKEN);
const db = new DB(process.env.DB);

const proxy = new Proxy(db, {
    get: (target, prop, receiver) => {
        return target._models[prop];
    }
});

bot.on('ready', async () => {
    console.log('Git ready to log!');

    bot.guilds.map(guild => guild).forEach(async guild => {
        let guildCommits = await proxy.Log.find({ guildID: guild.id });

        if (guildCommits.length === 0) {
            console.log('Creating commits for', guild.id);
            const guildJSON = cleanGuild(guild);

            await proxy.Log.create({
                guildID: guild.id,
                change: 'create',
                guildPart: 'guild',
                partID: guild.id,
                perpID: bot.user.id,
                oldValue: {},
                newValue: {},
                commitID: uuid()
            });

            for (let channel of guild.channels.map(channel => channel)) {
                const channelJSON = cleanChannel(channel);

                await proxy.Log.create({
                    guildID: guild.id,
                    change: 'create',
                    guildPart: 'channel',
                    partID: channel.id,
                    perpID: bot.user.id,
                    oldValue: {},
                    newValue: channelJSON,
                    commitID: uuid()
                });
            }

            for (let role of guild.roles.map(role => role)) {
                const roleJSON = cleanRole(role);

                await proxy.Log.create({
                    guildID: guild.id,
                    change: 'create',
                    guildPart: 'role',
                    partID: role.id,
                    perpID: bot.user.id,
                    oldValue: {},
                    newValue: roleJSON,
                    commitID: uuid()
                });
            }
        }
    });
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