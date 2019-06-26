const deepDiff = require('deep-diff');

function cleanGuild(guild, alreadyJSON = false) {
    let guildJSON = guild;

    if (!alreadyJSON) {
        guildJSON = guild.toJSON();

        delete guildJSON.channels;
        delete guildJSON.roles;
        delete guildJSON.members;
        delete guildJSON.memberCount;
        delete guildJSON.joinedAt;
        delete guildJSON.large;
        delete guildJSON.maxPresences;
        delete guildJSON.id;
        delete guildJSON.unavailable;
    }

    delete guildJSON.ownerID;
    delete guildJSON.emojis;
    delete guildJSON.icon;
    delete guildJSON.splash;
    delete guildJSON.banner;
    delete guildJSON.features;

    return guildJSON;
}

function cleanChannel(channel, alreadyJSON = false) {
    let channelJSON = channel;

    if (!alreadyJSON) {
        channelJSON = channel.toJSON();

        delete channelJSON.mention;
        delete channelJSON.guild;
        delete channelJSON.id;
        delete channelJSON.messages;
        delete channelJSON.lastMessageID;
        delete channelJSON.lastPinTimestamp;
        delete channelJSON.userLimit;
        delete channelJSON.voiceMembers;
    }

    if (channelJSON.type === 2) {
        delete channelJSON.nsfw;
    }

    channelJSON.permissionOverwrites = channelJSON.permissionOverwrites.map(item => item);

    return channelJSON;
}

function cleanRole(role, alreadyJSON = false) {
    let roleJSON = role;

    if (!alreadyJSON) {
        roleJSON = role.toJSON();

        delete roleJSON.mention;
        delete roleJSON.guild;
        delete roleJSON.id;
        delete roleJSON.createdAt;
    }

    delete roleJSON.managed;

    return roleJSON;
}

function diff(oldValue, newValue) {
    let changed = [];

    const changedAST = deepDiff(oldValue, newValue);

    for (let change of changedAST) {

        if (change.path.length === 1) {
            changed.push(change.path[0]);
        }
    }

    return changed;
}

module.exports = {
    cleanGuild,
    cleanChannel,
    cleanRole,
    diff
};