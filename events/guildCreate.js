const { cleanGuild } = require('../utils');

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

    // TODO: scrape Audit Log
};
