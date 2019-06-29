const { createVirtualRepresentation: createRep } = require('../utils');
const magic = require('../handlers');

async function rollback(bot, db, msg, commitID) {
    let commit = await db.Log.findOne({ commitID });

    if (commit.guildID != msg.channel.guild.id) return bot.createMessage(msg.channel.id, 'That commit does not belong to this guild!');

    let reps = await createRep(db, commit._id, true);

    reps = reps.map(r => {
        r.id = r._id
        return r
    });

    reps.forEach(async r => {
        const opts = {
            bot: bot,
            guildID: msg.channel.guild.id,
            type: r.type,
            affectedID: r.id,
            data: r.virtual
        };

        await magic(opts, db);
    });
}

async function revert(bot, db, msg, commitID) {
    let commit = await db.Log.findOne({ commitID });

    if (commit.guildID != msg.channel.guild.id) return bot.createMessage(msg.channel.id, 'That commit does not belong to this guild!');

    switch (commit.change) {
        case 'create': {
            if (commit.guildPart === 'channel') {
                await bot.deleteChannel(commit.partID, 'Revert Git action');
            } else if (commit.guildPart === 'role') {
                await bot.deleteRole(commit.guildID, commit.partID, 'Revert git action');
            }
        }
            break
        case 'update': {
            switch (commit.guildPart) {
                case 'guild': {
                    await bot.editGuild(commit.guildID, commit.oldValue, 'Revert git action');
                }
                    break;
                case 'channel': {
                    let channel = bot.getChannel(commit.partID);

                    if (!channel) {
                        channel = await msg.channel.guild.createChannel('tempgitchannel', commit.oldValue.type ? commit.oldValue.type : 0, 'Fulfill git action', commit.oldValue.parentID ? commit.oldValue.parentID : null)
                        commit.partID = channel.id
                    }

                    await bot.editChannel(commit.partID, commit.oldValue, 'Revert git action');
                }
                    break;
                case 'role': {
                    let role = msg.channel.guild.roles.find(r => r.id === commit.partID);

                    if (!role) {
                        role = await msg.channel.guild.createRole({ name: 'tempgitroleyay' })
                        commit.partID = role.id
                    }

                    if (commit.oldValue.hasOwnProperty('position')) {
                        await bot.editRolePosition(commit.guildID, commit.partID, oldValue.position);
                    }

                    if (commit.oldValue.hasOwnProperty('position') && Object.keys(commit.oldValue).length === 1) return

                    if (commit.oldValue.permissions) {
                        commit.oldValue.permissions = commit.oldValue.permissions.allow | commit.oldValue.permissions.deny
                    }

                    await bot.editRole(commit.guildID, commit.partID, commit.oldValue, 'Revert git action');
                }
                    break;
            }
        }
            break;
        case 'delete': {
            let obj;

            if (commit.guildPart === 'channel') {
                obj = await bot.createChannel(commit.guildID, commit.oldValue.name, commit.oldValue.type, 'Revert Git action', commit.oldValue);
                await db.Log.updateMany({ partID: commit.partID, guildPart: commit.guildPart }, { partID: obj.id });
            } else if (commit.guildPart === 'role') {
                obj = await bot.createRole(commit.guildID, commit.oldValue, 'Revert git action');
                await db.Log.updateMany({ partID: commit.partID, guildPart: commit.guildPart }, { partID: obj.id });
            }

            const opts = {
                bot: bot,
                guildID: msg.channel.guild.id,
                type: commit.guildPart,
                data: commit.oldValue,
                affectedID: obj.id
            };

            await magic(opts, db);
        }
            break;
    }
}

String.prototype.toProperCase = function () {
    // TODO: Clean this up lol
    /*
    * Sources: 
    * Sentence Case: https://stackoverflow.com/a/5574446 
    * Adding a space: https://stackoverflow.com/a/25452019
    */
    let str = this.replace(/([A-Z])/g, ' $1').trim()
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

module.exports = async (bot, db, msg) => {

    if (msg.content === '!ping') {
        bot.createMessage(msg.channel.id, 'Pong!');
    } else if (msg.content.startsWith('!fetch')) {
        const commitID = msg.content.replace('!fetch ', '')
        const commit = await db.Log.findOne({ commitID });
        const rep = await createRep(db, commit._id)
        console.log(rep)
    } else if (msg.content.startsWith('!goto')) {
        const commitID = msg.content.replace('!goto ', '');

        rollback(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!rollback')) {
        const commitID = msg.content.replace('!rollback ', '');

        rollback(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!revert')) {
        const commitID = msg.content.replace('!revert ', '');

        revert(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!view')) {
        const data = {
            "embed": {
                "title": "Logs for: " + msg.channel.guild.name,
                "color": 8353673,
                "timestamp": new Date(),
                "fields": []
            }
        }
        const amt = parseInt(msg.content.replace('!view ', '') !== '' ? msg.content.replace('!view ', '') : '1');
        const history = await db.Log
            .find({ guildID: msg.channel.guild.id })
            .sort({ 'date': 1 })
            .skip((amt - 1) * 10)
            .limit(10)
            .exec();

        // console.log(history);

        history.forEach(change => {
            if (!change.newValue) change.newValue = {};
            let name = `:tools: **Upgrade** ${change.guildPart.toProperCase()}`
            let value = `${JSON.stringify(change.newValue).toProperCase()} \nChanged By: <@${change.perpID}> \nID: \`${change.commitID}\``

            data.embed.fields.push({
                "name": name,
                "value": value,
                "inline": true
            })
            /*data.embed.fields.push({
                "name": ":tools: **" + change.change.toUpperCase() + '** ' + change.guildPart.toUpperCase(),
                "value": `${change.oldValue.name} \nChanged By: <@${change.perpID}>`,
                "inline": true
            })*/
        });

        bot.createMessage(msg.channel.id, data)
    }
};
