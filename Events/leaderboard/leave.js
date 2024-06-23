const Discord = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, bot, config) {
    if(member.guild && !member.user.bot) {
        const req = bot.functions.checkGuild(bot, member.guild.id)
        const json = JSON.parse(req.joins)
        json["leave"] = Number(json.leave) + 1
        bot.db.prepare(`UPDATE guild SET joins = @pic WHERE id = @id`).run({ pic: JSON.stringify(json), id: member.guild.id});
    }
  }
}