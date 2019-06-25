module.exports = async (bot, db, guild) => {
    await db.Log.create({
        guildID: guild.id,
        change: 'create',
        guildPart: 'guild',
        partID: guild.id,
        oldValue: {},
        newValue: guild.toJSON()
    });
};
