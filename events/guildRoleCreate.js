const { cleanRole } = require('../utils');

module.exports = async (bot, db, guild, role) => {
    const roleJSON = cleanRole(role);

    await db.Log.create({
        guildID: guild.id,
        change: 'create',
        guildPart: 'role',
        partID: role.id,
        oldValue: {},
        newValue: roleJSON
    });
};
