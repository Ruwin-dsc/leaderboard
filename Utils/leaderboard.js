function checkguild(bot, guildId) {
    const req = bot.db.prepare('SELECT * FROM guild WHERE id = ?').get(guildId)
    return req
}

module.exports = {
    checkGuild: checkguild
}