const { cleanGuild, diff } = require('../utils');

module.exports = async (bot, db, guild, oldGuild) => {
    const guildJSON = cleanGuild(guild);
    const oldGuildJSON = cleanGuild(oldGuild, true);

    let changedKeys = diff(oldGuildJSON, guildJSON);

    if (changedKeys.length === 0) return;

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldGuildJSON[key];
        newValue[key] = guildJSON[key];
    }


    if (guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await guild.getAuditLogs(1, null, 1) // 1 is GUILD_UPDATE
            const user = logArray.users[0]

            await db.Log.create({
                guildID: guild.id,
                change: 'update',
                guildPart: 'guild',
                partID: guild.id,
                perpID: user.id,
                oldValue,
                newValue
            });
        }, 1000)
    }


};
