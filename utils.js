const deepDiff = require('deep-diff');
const { Types } = require('mongoose');

function cleanGuild(guild, alreadyJSON = false) {
    let guildJSON = guild;

    if (!alreadyJSON) {
        guildJSON = guild.toJSON();

        delete guildJSON.channels;
        delete guildJSON.roles;
        delete guildJSON.members;
        delete guildJSON.memberCount;
        delete guildJSON.joinedAt;
        delete guildJSON.maxPresences;
        delete guildJSON.id;
        delete guildJSON.unavailable;
    } else {
        delete guildJSON.systemChannelID;
    }

    delete guildJSON.ownerID;
    delete guildJSON.emojis;
    delete guildJSON.icon;
    delete guildJSON.splash;
    delete guildJSON.banner;
    delete guildJSON.features;
    delete guildJSON.large;
    delete guildJSON.defaultNotifications;

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

    channelJSON.permissionOverwrites = channelJSON.permissionOverwrites.map(item => item.toJSON());

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
    } else {
        roleJSON.permissions = role.permissions.toJSON();
    }

    delete roleJSON.managed;

    return roleJSON;
}

function diff(oldValue, newValue) {
    let changed = [];

    const changedAST = deepDiff(oldValue, newValue);

    if (!changedAST) return changed;

    for (let change of changedAST) {
        if (change.path.length > 0) {
            changed.push(change.path[0]);
        }
    }

    return changed;
}

async function createVirtualRepresentation(db, commit, atCommit = false) { // commit should not be commitID but _id
    let change = await db.Log.findOne({ _id: Types.ObjectId(commit) }).lean().exec();

    return await db.Log.aggregate([
        {
            $match: {
                _id: atCommit ? { $lte: change._id } : { $lt: change._id },
                guildID: change.guildID
            }
        },
        {
            $group: {
                _id: { partID: '$partID', part: '$guildPart' },
                virtual: {
                    $mergeObjects: '$newValue'
                }
            }
        },
        {
            $project: {
                _id: '$_id.partID',
                type: '$_id.part',
                virtual: 1
            }
        }
    ]).exec();
}

module.exports = {
    cleanGuild,
    cleanChannel,
    cleanRole,
    diff,
    createVirtualRepresentation
};