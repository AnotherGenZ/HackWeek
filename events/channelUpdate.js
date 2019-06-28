const { cleanChannel, diff } = require('../utils');

module.exports = async (bot, db, channel, oldChannel) => {
    console.log('cupdate')
    const channelJSON = cleanChannel(channel);
    const oldChannelJSON = cleanChannel(oldChannel, true);

    let changedKeys = diff(oldChannelJSON, channelJSON);
    if (changedKeys.indexOf('bitrate') !== -1 && channel.type === 0) {
        changedKeys.splice(changedKeys.indexOf('bitrate'), 1)
    }

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldChannelJSON[key];
        newValue[key] = channelJSON[key];
        console.log(`KEY: ${key} NEW ${channelJSON[key]} OLD ${oldChannelJSON[key]}`)
    }

    if (channel.guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await channel.guild.getAuditLogs(1, null, 11) // 11 is CHANNEL_UPDATE
            const user = logArray.users[0]
            if (user.id === bot.user.id) return
            await db.Log.create({
                guildID: channel.guild.id,
                change: 'update',
                guildPart: 'channel',
                partID: channel.id,
                perpID: user.id,
                oldValue,
                newValue
            });
        }, 1000)
    }
};
