const { cleanRole } = require('../utils');

module.exports = async (bot, db, guild, role) => {
    const roleJSON = cleanRole(role);

    if (guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await guild.getAuditLogs(1, null, 32) // 32 is ROLE_DELETE
            const user = logArray.users[0]
            await db.Log.create({
                guildID: guild.id,
                change: 'delete',
                guildPart: 'role',
                partID: guild.id,
                perpID: user.id,
                oldValue: roleJSON,
                newValue: {}
            });
        }, 1000)
    }
};
