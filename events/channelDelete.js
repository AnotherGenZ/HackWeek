const { cleanChannel } = require('../utils');

module.exports = async (bot, db, channel) => {
    const channelJSON = cleanChannel(channel);

    if (channel.guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await channel.guild.getAuditLogs(1, null, 12) // 12 is CHANNEL_DELETE
            const user = logArray.users[0]
            await db.Log.create({
                guildID: channel.guild.id,
                change: 'delete',
                guildPart: 'channel',
                partID: channel.id,
                perpID: user.id,
                oldValue: channelJSON,
                newValue: {}
            });
        }, 1000)
    }
};
