const createRep = require('../utils').createVirtualRepresentation
const magic = require('../handlers')

function rollback(bot, db, msg, commitID) {
       let rep = await createRep(db, commitID);
        
       rep = rep.map(r => {
           r.id = r._id
           return r
       });
        
       rep.forEach(async r => {
          const opts = {
              bot: bot,
              guildID: msg.channel.guild.id,
              type: r.type,
              affectedID: r.id,
              data: r.virtual
            };
            
         await magic(opts);
        });
}

module.exports = async (bot, db, msg) => {
    if (msg.content === '!ping') {
        bot.createMessage(msg.channel.id, 'Pong!');
    } else if (msg.content.startsWith('!fetch')) {
        const suffix = msg.content.replace('!fetch ', '')
        const rep = await createRep(db, suffix)
        console.log(rep)
    } else if (msg.content.startsWith('!goto')) {
        const commitID = msg.content.replace('!goto ', '');
     
        rollback(bot, db, msg, commitID);
    } else if (msg.content.startsWith('!rollback')) {
        const commitID = msg.content.replace('!rollback ', '');
        
        rollback(bot, db, msg, commitID);
    }
};
