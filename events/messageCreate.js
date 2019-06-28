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
        break
        case 'update': {
            switch (commit.guildPart) {
                case 'guild': {
                    await bot.editGuild(commit.guildID, commit.oldValue, 'Revert git action');
                }
                break
                case 'channel': {
                    let channel = bot.getChannel(commit.partID)
                    if (!channel) {
                        channel = await msg.channel.guild.createChannel('tempgitchannel', commit.oldValue.type ? commit.oldValue.type : 0, 'Fulfill git action', commit.oldValue.parentID ? commit.oldValue.parentID : null)
                        commit.partID = channel.id
                    }
                    await bot.editChannel(commit.partID, commit.oldValue, 'Revert git action');
                }
                break
                case 'role': {
                    console.log('rupdate', commit.guildID, commit.partID, commit.oldValue, commit.guildPart)
                    let role = msg.channel.guild.roles.find(r => r.id === commit.partID)
                    if (!role) {
                        role = await msg.channel.guild.createRole({name: 'tempgitroleyay'})
                        commit.partID = role.id
                    }

                    if (commit.oldValue.hasOwnProperty('position')) {
                        await bot.editRolePosition(commit.guildID, commit.partID, oldValue.position);
                    }

                    if (commit.oldValue.hasOwnProperty('position') && Object.keys(commit.oldValue).length === 1) return
                    await bot.editRole(commit.guildID, commit.partID, commit.oldValue, 'Revert git action');
                }
                break
            }
        }
        break
        case 'delete': {
            console.log('del')
            if (commit.guildPart === 'channel') {
                await bot.createChannel(commit.guildID, commit.oldValue.name, commit.oldValue.type, 'Revert Git action', commit.oldValue);
            } else if (commit.guildPart === 'role') {
                await bot.createRole(commit.guildID, commit.oldValue, 'Revert git action');
            }
            // let reps = await createRep(db, commit._id);
            // let rep = reps.find(r => r._id === commit.partID);

            // const opts = {
            //     bot: bot,
            //     guildID: msg.channel.guild.id,
            //     type: rep.type,
            //     data: rep.virtual
            // };

            // await magic(opts);
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
