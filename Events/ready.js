module.exports = {
  name: 'ready',
  async execute(bot) {
    await bot.application.commands.set(bot.arrayOfSlashCommands);

    await bot.user.setPresence({ activities: [{ name: 'By ruwinou', type: 5 }], status: 'idle' });
  },
};