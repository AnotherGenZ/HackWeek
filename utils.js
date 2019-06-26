const deepDiff =  require('deep-diff');

function cleanGuild(guild) {
    let guildJSON = guild.toJSON();

    delete guildJSON.channels;
    delete guildJSON.roles;
    delete guildJSON.members;
    delete guildJSON.memberCount;
    delete guildJSON.features;
    delete guildJSON.joinedAt;
    delete guildJSON.large;
    delete guildJSON.maxPresences;
    delete guildJSON.ownerID;
    delete guildJSON.unavailable;
    delete guildJSON.emojis;

    return guildJSON;
}

function cleanChannel(channel) {
    let channelJSON = channel.toJSON();

    delete channelJSON.mention;
    delete channelJSON.guild;
    delete channelJSON.id;

    channelJSON.permissionOverwrites = channelJSON.permissionOverwrites.map(item => item);

    return channelJSON;
}

function cleanRole(role) {
    let roleJSON = role.toJSON();

    delete roleJSON.mention;
    delete roleJSON.managed;
    delete roleJSON.guild;
    delete roleJSON.id;
    delete roleJSON.createdAt;

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