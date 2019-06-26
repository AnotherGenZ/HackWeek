const { cleanChannel, diff } = require('../utils');

module.exports = async (bot, db, channel, oldChannel) => {
    const channelJSON = cleanChannel(channel);
    const oldChannelJSON = cleanChannel(oldChannel);

    let changedKeys = diff(oldChannelJSON, channelJSON);

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldChannelJSON[key];
        newValue[key] = oldChannelJSON[key];
    }

    await db.Log.create({
        guildID: guild.id,
        change: 'update',
        guildPart: 'channel',
        partID: channel.id,
        oldValue,
        newValue
    });
};
