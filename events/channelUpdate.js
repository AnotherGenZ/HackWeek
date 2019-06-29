const { cleanChannel, diff } = require('../utils');
const { v4: uuid } = require('uuid')

module.exports = async (bot, db, channel, oldChannel) => {
    const channelJSON = cleanChannel(channel);
    const oldChannelJSON = cleanChannel(oldChannel, true);

    let changedKeys = diff(oldChannelJSON, channelJSON);

    if (changedKeys.indexOf('bitrate') !== -1 && channel.type === 0) {
        changedKeys.splice(changedKeys.indexOf('bitrate'), 1)
    }

    let oldValue = {};
    let newValue = {};

    if (changedKeys.length === 0) return;

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
                partID: channel.id,
                perpID: user.id,
                oldValue,
                newValue,
                commitID: uuid()
            });
        }, 1000)
    }
};
