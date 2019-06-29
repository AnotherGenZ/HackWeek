const { cleanChannel } = require('../utils');
const { v4: uuid } = require('uuid')

module.exports = async (bot, db, channel) => {
    const channelJSON = cleanChannel(channel);

    if (channel.guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await channel.guild.getAuditLogs(1, null, 10) // 10 is CHANNEL_CREATE
            const user = logArray.users[0]

            await db.Log.create({
                guildID: channel.guild.id,
                change: 'create',
                guildPart: 'channel',
                partID: channel.id,
                perpID: user.id,
                oldValue: {},
                newValue: channelJSON,
                commitID: uuid()
            });
        }, 1000)
    }
};
