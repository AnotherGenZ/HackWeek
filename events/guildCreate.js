const { cleanGuild, cleanChannel, cleanRole } = require('../utils');

module.exports = async (bot, db, guild) => {
    const guildJSON = cleanGuild(guild);

    await db.Log.create({
        guildID: guild.id,
        change: 'create',
        guildPart: 'guild',
        partID: guild.id,
        oldValue: {},
        newValue: guildJSON
    });

    for (let channel of guild.channels.map(channel => channel)) {
        const channelJSON = cleanChannel(channel);

        await db.Log.create({
            guildID: guild.id,
            change: 'create',
            guildPart: 'channel',
            partID: channel.id,
            oldValue: {},
            newValue: channelJSON
        });
    }

    for (let role of guild.roles.map(role => role)) {
        const roleJSON = cleanRole(role);

        await db.Log.create({
            guildID: guild.id,
            change: 'create',
            guildPart: 'role',
            partID: role.id,
            oldValue: {},
            newValue: roleJSON
        });
    }
};
