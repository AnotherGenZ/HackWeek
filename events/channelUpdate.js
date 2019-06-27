const { cleanChannel, diff } = require('../utils');

module.exports = async (bot, db, channel, oldChannel) => {
    const channelJSON = cleanChannel(channel);
    const oldChannelJSON = cleanChannel(oldChannel, true);

    let changedKeys = diff(oldChannelJSON, channelJSON);

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldChannelJSON[key];
        newValue[key] = channelJSON[key];
    }

    if (channel.guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await channel.guild.getAuditLogs(1, null, 11) // 11 is CHANNEL_UPDATE
            const user = logArray.users[0]
            await db.Log.create({
                guildID: channel.guild.id,
                change: 'update',
                guildPart: 'channel',
                partID: channel.guild.id,
                perpID: user.id,
                oldValue,
                newValue
            });
        }, 1000)
    }
};
