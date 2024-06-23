const Discord = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, bot, config) {
    if(message.guild && !message.author.bot) {
        const req = bot.functions.checkGuild(bot, message.guild.id)
        const json = JSON.parse(req.lbMessage)
        json["messages"] = Number(json.messages) + 1
        if(!json.contributor.includes(message.author.id)) json.contributor.push(message.author.id)
        bot.db.prepare(`UPDATE guild SET lbMessage = @pic WHERE id = @id`).run({ pic: JSON.stringify(json), id: message.guild.id});
    }
  }
}