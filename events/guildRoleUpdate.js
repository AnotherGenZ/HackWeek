const { cleanRole, diff } = require('../utils');
const { v4: uuid } = require('uuid')

module.exports = async (bot, db, guild, role, oldRole) => {
    if (role.name === '@everyone') return // screw this
    console.log('rupdate event')
    console.log('ALLOW', role.permissions.allow, role.permissions.deny)
    role.permissions = role.permissions.allow
    oldRole.permissions = oldRole.permissions.allow
    
    const roleJSON = cleanRole(role);
    const oldRoleJSON = cleanRole(oldRole, true);
    console.log('NEWROLE', roleJSON)
    console.log('\n\n\n\nOLDROLE', oldRoleJSON)

    let changedKeys = diff(oldRoleJSON, roleJSON);
    if (!changedKeys) {
        return console.warn('OK ignoring ' + role.name + ' because nothing was changed lol', changedKeys)
    } else {
        console.log('OK proceeding', changedKeys)
    }

    let oldValue = {};
    let newValue = {};

    for (let key of changedKeys) {
        oldValue[key] = oldRoleJSON[key];
        newValue[key] = roleJSON[key];
        console.log(`KEY: ${key} NEW ${roleJSON[key]} OLD ${oldRoleJSON[key]}`)
    }

    if (guild.members.get(bot.user.id).permission.json['viewAuditLogs']) {
        setTimeout(async () => {
            const logArray = await guild.getAuditLogs(1, null, 31) // 31 is ROLE_UPDATE
            const user = logArray.users[0]
            if (user.id === bot.user.id) return
            console.log('FINISH WITH', newValue, oldValue)
            await db.Log.create({
                guildID: guild.id,
                change: 'update',
                guildPart: 'role',
                partID: role.id,
                perpID: user.id,
                oldValue: oldValue,
                newValue: newValue,
                commitID: uuid()
            });
        }, 1000)
    }
};
