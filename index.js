/*/ BOT /*/

const Discord = require('discord.js');
const bot = new Discord.Client({ intents: 3276799, partials: [Discord.Partials.Channel, Discord.Partials.Message, Discord.Partials.User, Discord.Partials.GuildMember, Discord.Partials.Reaction, Discord.Partials.ThreadMember, Discord.Partials.GuildScheduledEvent] });
bot.commands = new Discord.Collection();
bot.slashCommands = new Discord.Collection();
bot.setMaxListeners(70);

bot.login(require('./config.json').token).then(() => { console.log(`[!] — Logged in as ${bot.user.tag} (${bot.user.id})`); }).catch(() => { console.log('\x1b[31m[!] — Please configure a valid bot token\x1b[0m'); });

const commandHandler = require('./Handler/Commands.js')(bot);
const slashcommandHandler = require('./Handler/slashCommands.js')(bot);
const eventdHandler = require('./Handler/Events')(bot);
const DatabaseHandler = require('./Handler/database')(bot);
const anticrashHandler = require('./Handler/anticrash');
anticrashHandler(bot);
bot.db = DatabaseHandler;
bot.functions = require('./Utils/leaderboard.js')
bot.sb = false

/*/ SB /*/

const discordSb = require('discord.js-selfbot-v13')
const client = new discordSb.Client({ checkUpdate: false });

require('./Handler/Events')(client)
client.functions = require('./Utils/leaderboard.js')
client.db = DatabaseHandler
client.sb = true
anticrashHandler(client)

client.login(require('./config.json').tokenSB).then(() => { console.log(`[!] — Logged in as ${client.user.username} (${client.user.id})`); }).catch(() => { console.log('\x1b[31m[!] — Please configure a valid client token\x1b[0m'); });