const { cleanRole } = require('../utils');

module.exports = async (bot, db, guild, role) => {
    const roleJSON = cleanRole(role);

    await db.Log.create({
        guildID: guild.id,
        change: 'delete',
        guildPart: 'role',
        partID: role.id,
        oldValue: roleJSON,
        newValue: {}
    });
};
