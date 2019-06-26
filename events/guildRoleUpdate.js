const { cleanRole, diff } = require('../utils');

module.exports = async (bot, db, guild, role, oldRole) => {
    const roleJSON = cleanRole(role);
    const oldRoleJSON = cleanRole(oldRole);

    let changedKeys = diff(oldRoleJSON, roleJSON);

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldChannelJSON[key];
        newValue[key] = oldChannelJSON[key];
    }

    await db.Log.create({
        guildID: guild.id,
        change: 'update',
        guildPart: 'role',
        partID: role.id,
        oldValue,
        newValue
    });
};
