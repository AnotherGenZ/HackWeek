const { cleanChannel } = require('../utils');

module.exports = async (bot, db, channel) => {
    const channelJSON = cleanChannel(channel);

    await db.Log.create({
        guildID: guild.id,
        change: 'delete',
        guildPart: 'channel',
        partID: channel.id,
        oldValue: channelJSON,
        newValue: {}
    });
};
