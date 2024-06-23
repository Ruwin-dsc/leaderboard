module.exports = {
  name: 'ready',
  async execute(bot) {
    if(!bot.sb) await bot.application.commands.set(bot.arrayOfSlashCommands);
    if(!bot.sb) await bot.user.setPresence({ activities: [{ name: 'Regarde les stats du serveur.', type: 2 }], status: 'idle' });
    setInterval(() => { 
      bot.guilds.cache.forEach(guild => {
        let botDB = bot.db.prepare('SELECT * FROM guild WHERE id = ?').get(guild.id)
        if(!botDB) {
          bot.db.exec(`INSERT INTO guild (id) VALUES ('${guild.id}')`);
          botDB = bot.db.prepare('SELECT * FROM guild WHERE id = ?').get(guild.id)
        }
      })
    }, 5000)

    setInterval(() => { 
      bot.guilds.cache.forEach(guild => {
        const req = bot.functions.checkGuild(bot, guild.id)
        if(guild.members.cache.map(x => x).filter(x => x?.voice?.channel).length > Number(req.pic)) {
          bot.db.prepare(`UPDATE guild SET pic = @pic WHERE id = @id`).run({ pic: guild.members.cache.map(x => x).filter(x => x?.voice?.channel).length, id: guild.id});
        }
      })
    }, 15000)
  },
};