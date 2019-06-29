const { cleanGuild, cleanChannel, cleanRole } = require('../utils');
const { v4: uuid } = require('uuid')

module.exports = async (bot, db, guild) => {
    const guildJSON = cleanGuild(guild);

    await db.Log.create({
        guildID: guild.id,
        change: 'create',
        guildPart: 'guild',
        partID: guild.id,
        perpID: bot.user.id,
        oldValue: {},
        newValue: guildJSON,
        commitID: uuid()
    });

    for (let channel of guild.channels.map(channel => channel)) {
        const channelJSON = cleanChannel(channel);

        await db.Log.create({
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

        await db.Log.create({
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
};
