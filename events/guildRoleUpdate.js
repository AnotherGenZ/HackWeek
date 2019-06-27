const { cleanRole, diff } = require('../utils');

module.exports = async (bot, db, guild, role, oldRole) => {
    const roleJSON = cleanRole(role);
    const oldRoleJSON = cleanRole(oldRole, true);

    let changedKeys = diff(oldRoleJSON, roleJSON);

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldRoleJSON[key];
        newValue[key] = roleJSON[key];
    }

    if (guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await guild.getAuditLogs(1, null, 31) // 31 is ROLE_UPDATE
            const user = logArray.users[0]
            await db.Log.create({
                guildID: guild.id,
                change: 'update',
                guildPart: 'role',
                partID: guild.id,
                perpID: user.id,
                oldValue,
                newValue
            });
        }, 1000)
    }
};
