const { createVirtualRepresentation: createRep } = require('../utils');
const magic = require('../handlers');

async function rollback(bot, db, msg, commitID) {
    let commit = await db.Log.findOne({ commitID });

    if (commit.guildID != msg.channel.guild.id) return bot.createMessage(msg.channel.id, 'That commit does not belong to this guild!');

    let reps = await createRep(db, commit._id);

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

        await magic(opts);
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
        case 'update': {
            switch (commit.guildPart) {
                case 'guild': {
                    await bot.editGuild(commit.guildID, commit.oldValue, 'Revert git action');
                }
                case 'channel': {
                    await bot.editChannel(commit.partID, commit.oldValue, 'Revert git action');
                }
                case 'role': {
                    await bot.editRole(commit.guildID, commit.partID, commit.oldValue, 'Revert git action');

                    if (oldValue.hasOwnProperty('position')) {
                        await bot.editRolePosition(commit.guildID, commit.partID, oldValue.position);
                    }
                }
            }
        }
        case 'delete': {
            let reps = await createRep(db, commit._id);
            let rep = reps.find(r => r._id === commit.partID);

            const opts = {
                bot: bot,
                guildID: msg.channel.guild.id,
                type: rep.type,
                data: rep.virtual
            };

            await magic(opts);
        }
    }
}

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

        revert(bot, db, msg, commitID).then(() => {
            bot.createMessage(msg.channel.id, "Reverted commit: `" + commitID + "`.")
        })
    } else if (msg.content.startsWith('!view')) {
        const data = {
            "embed": {
                "title": "Logs for: " + msg.channel.guild.name,
                "color": 8353673,
                "timestamp": new Date(),
                "thumbnail": {
                    "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                "fields": []
            }
        }
        const history = await db.Log.find({guildID: msg.channel.guild.id})
        bot.createMessage(msg.channel.id, data)
        history.forEach(change => {
            if(!change.oldValue) return;
            data.embed.fields.push({
                "name": ":tools: **" + change.change.toUpperCase() + '** ' + change.guildPart.toUpperCase(),
                "value": change.oldValue.name,
                "inline": true
            })
        })
        bot.createMessage(msg.channel.id, data)
    }
};
