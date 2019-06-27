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
                bot.deleteChannel(commit.partID, 'Revert Git action');
            } else if (commit.guildPart === 'role') {
                bot.deleteRole(commit.guildID, commit.partID, 'Revert git action');
            }
        }
        case 'update': {
            switch (commit.guildPart) {
                case 'guild': {
                    bot.editGuild(commit.guildID, commit.oldValue, 'Revert git action');
                }
                case 'channel': {
                    bot.editChannel(commit.partID, commit.oldValue, 'Revert git action');
                }
                case 'role': {
                    bot.editGuild(commit.guildID, commit.partID, commit.oldValue, 'Revert git action');
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
        const suffix = msg.content.replace('!fetch ', '')
        const rep = await createRep(db, suffix)
        console.log(rep)
    } else if (msg.content.startsWith('!goto')) {
        const commitID = msg.content.replace('!goto ', '');

        rollback(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!rollback')) {
        const commitID = msg.content.replace('!rollback ', '');

        rollback(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!revert')) {
        const commitID = msg.content.replace('!revert ', '');


    }
};
