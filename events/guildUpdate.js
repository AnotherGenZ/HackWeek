const { cleanGuild, diff } = require('../utils');

module.exports = async (bot, db, guild, oldGuild) => {
    const guildJSON = cleanGuild(guild);
    const oldGuildJSON = cleanGuild(oldGuild, true);

    let changedKeys = diff(oldGuildJSON, guildJSON);

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldGuildJSON[key];
        newValue[key] = guildJSON[key];
    }

    await db.Log.create({
        guildID: guild.id,
        change: 'update',
        guildPart: 'guild',
        partID: guild.id,
        oldValue,
        newValue
    });
};
