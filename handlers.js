const supportedChannelProperties = [
    'name',
    'nsfw',
    'topic',
    'bitrate',
    'rateLimitPerUser',
    'position'
]

const supportedRoleProperties = [
    'name',
    'mentionable',
    'hoist',
    'color',
    'permissions'
]

const supportedGuildProperties = [
    'afkChannelID',
    'afkTimeout',
    'name',
    'mfaLevel',
    'region',
    'systemChannelID',
    'verificationLevel'
]

/*
{
    guildID: 'wew',
    affectedID: 'wew' create if missing
    data: role data (whole object please)
}
*/
async function createRole(opts, db) {
    const roleObject = {
        name: 'tempgitrole'
    }

    if (opts.data.name) roleObject.name = opts.data.name
    if (opts.data.hasOwnProperty('permissions')) roleObject.permissions = opts.data.permissions
    if (opts.data.hasOwnProperty('color')) roleObject.color = opts.data.color
    if (opts.data.hasOwnProperty('hoist')) roleObject.hoist = opts.data.hoist
    if (opts.data.hasOwnProperty('mentionable')) roleObject.mentionable = opts.data.mentionable

    let role = await opts.bot.guilds.get(opts.guildID).createRole(roleObject, 'Fulfilling git action')
    await db.Log.updateMany({ partID: opts.affectedID, guildPart: 'role' }, { partID: role.id });
}


/*
{
    guildID: 'wew',
    affectedID: 'wew' create if missing
    data: channel object/data
}
*/
async function createChannel(opts, db) {
    const channel = await opts.bot.guilds.get(opts.guildID).createChannel(JSON.stringify({ name: 'temp' }))
    const updated = await db.Log.updateMany({ partID: opts.affectedID, guildPart: 'channel' }, { partID: channel.id }).exec();
    opts.affectedID = channel.id
    // console.log(opts.affectedID);
    return await module.exports(opts)
}


/*
{
    bot: bot object passed from event
    guildID: 'wew',
    type: role, channel, guild
    affectedID: ''
    data: obj
}
*/
module.exports = async (opts, db) => {
    switch (opts.type) {
        case 'channel':
            if (!opts.affectedID) { // The channel was deleted and the bot needs to recreate it.
                await createChannel(opts, db)
            } else {
                const channel = await opts.bot.getChannel(opts.affectedID);

                if (!channel) {
                    console.log(opts.affectedID);
                    return await createChannel(opts, db);
                }

                if (opts.data.hasOwnProperty('permissionOverwrites') && opts.data.permissionOverwrites.length !== 0) {
                    const passedPermIDs = opts.data.permissionOverwrites.map(o => o.id ? o.id : opts.guildID);
                    const unneccessaryPerms = channel.permissionOverwrites.map(o => o.id ? o.id : opts.guildID).filter(o => !passedPermIDs.includes(o)) // These perms are not present in the passed data and should be discarded

                    passedPermIDs.forEach(async permID => {
                        const perm = opts.data.permissionOverwrites.find(permission => permID === opts.guildID ? !permission.id : permission.id === permID);
                        await opts.bot.getChannel(opts.affectedID).editPermission(permID ? permID : opts.guildID, perm.allow, perm.deny, perm.type, 'Fulfulling git operation')
                    })

                    unneccessaryPerms.forEach(async permID => {
                        await opts.bot.getChannel(opts.affectedID).deletePermission(permID)
                    })
                }
                const updateObj = {}
                supportedChannelProperties.forEach(async property => {
                    if (opts.data.hasOwnProperty(property) && channel[property] !== opts.data[property]) { // must use hasOwnProperty because topics can be empty, ratelimits can be 0, and so can position
                        updateObj[property] = opts.data[property]
                    }
                })

                await channel.edit(updateObj);
            }
            break
        case 'role':
            if (!opts.affectedID) { // The role being mentioned doesn't exist anymore.
                await createRole(opts, db)
            } else {
                const role = opts.bot.guilds.get(opts.guildID).roles.get(opts.affectedID);
                if (!role) return await createRole(opts, db)
                const updateObj = {}
                supportedRoleProperties.forEach(async property => {
                    if (opts.data.hasOwnProperty(property) && opts.data[property] !== role[property]) {
                        updateObj[property] = opts.data[property]
                    }
                })

                if (updateObj.permissions) {
                    updateObj.permissions = updateObj.permissions.allow | updateObj.permissions.deny
                }

                await role.edit(updateObj, 'Fulfilling git action')
                if (opts.data.position && opts.data.position !== role.position) {
                    await role.editPosition(opts.data.position) // yes.
                }
            }
            break
        case 'guild':
            const guild = opts.bot.guilds.get(opts.guildID)
            const updateObj = {}
            supportedGuildProperties.forEach(async property => {
                if (opts.data.hasOwnProperty(property) && opts.data[property] !== guild[property]) {
                    updateObj[property] = opts.data[property]
                }
            })
            await guild.edit(updateObj, 'Fulfilling git action')
            break
    }
}
