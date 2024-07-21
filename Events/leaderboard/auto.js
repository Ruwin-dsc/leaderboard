const Discord = require('discord.js')
const medals = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];
const discordSb = require('discord.js-selfbot-v13')
const client = new discordSb.Client({ checkUpdate: false });
client.login(require('../../config.json').tokenSB)

module.exports = {
    name: 'ready',
    async execute(bot) {
        if(bot.sb) return
        let guildList = []
        await bot.db.prepare('SELECT * FROM guild').all().forEach(async g => {
                const guild = await bot.guilds.cache.get(g.id) || await client.guilds.cache.get(g.id)
                if(guild) guildList.push(guild)
                }
            )
        setInterval(async () => {
            guildList = []
            await bot.db.prepare('SELECT * FROM guild').all().forEach(async g => {
                const guild = await bot.guilds.cache.get(g.id) || await client.guilds.cache.get(g.id)
                if(guild) guildList.push(guild)
                }
            )
        }, 50000)

        const messages = await bot.channels.cache.get(require('../../config.json').channel.voc).messages.fetch({ limit: 99 });
        const messages2 = await bot.channels.cache.get(require('../../config.json').channel.msg).messages.fetch({ limit: 99 });
        const messages3 = await bot.channels.cache.get(require('../../config.json').channel.join).messages.fetch({ limit: 99 });

        if(messages.size !== 0) await bot.channels.cache.get(require('../../config.json').channel.voc).bulkDelete(messages, true);
        if(messages2.size !== 0) await bot.channels.cache.get(require('../../config.json').channel.msg).bulkDelete(messages2, true);
        if(messages3.size !== 0) await bot.channels.cache.get(require('../../config.json').channel.join).bulkDelete(messages3, true);

        const msg = await bot.channels.cache.get(require('../../config.json').channel.voc).send({ content: `**Veuillez patienter... ⏳**` })
        const msg2 = await bot.channels.cache.get(require('../../config.json').channel.msg).send({ content: `**Veuillez patienter... ⏳**` })
        const msg3 = await bot.channels.cache.get(require('../../config.json').channel.join).send({ content: `**Veuillez patienter... ⏳**` })
        setInterval(async () => {
            let leaderboard = [];
            for (let i = 0; i < guildList.length; ++i) {
                let g = guildList.map(x => x)[i];
                if (g.members.cache.map(x => x).filter(x => x?.voice?.channel).length > 0) {
                    const pic = bot.functions.checkGuild(bot, g.id).pic
                    leaderboard.push({
                        name: g.name,
                        id: g.id,
                        vanityUrl: g.vanityURLCode ? `https://discord.gg/${g.vanityURLCode}` : `https://discord.gg/VAHYJHNKfn`,
                        member: g.memberCount,
                        vocal: g.members.cache.map(x => x).filter(x => x?.voice?.channel).length,
                        mute: g.members.cache.map(x => x).filter(x => x?.voice?.channel && (x?.voice?.mute || x?.voice?.selfMute || x?.voice?.deaf || x?.voice?.selfDeaf)).length,
                        stream: g.members.cache.map(x => x).filter(x => x?.voice?.channel && x?.voice?.streaming).length,
                        cam: g.members.cache.map(x => x).filter(x => x?.voice?.channel && x?.voice?.selfVideo).length,
                        pic: Math.round(pic), 
                    });
                };
            };
            leaderboard.sort((a, b) => b.vocal - a.vocal).slice(10);

            let counter = -1;

            let description = leaderboard.map((x, i) => {
                counter++
                return `\`${medals[counter] ? medals[counter] : counter }.\` [${x.name}](${x.vanityUrl}) (\`${x.member} membres\`):\n` +
                    `> ${x.vocal > 1 ? `Vocals: \`${x.vocal}\`` : `Vocals: \`${x.vocal}\``}\n` +
                    `> ${x.mute > 1 ? `Mutes \`${x.mute}\`` : `Mutes: \`${x.mute}\` `} ( ${Math.round((x.mute / x.vocal) * 100)}% )\n` +
                    `> ${x.stream > 1 ? `Streams: \`${x.stream}\`` : `Streams: \`${x.stream}\``}\n` +
                    `> ${x.cam > 1 ? `Caméras: \`${x.cam}\`` : `Caméras: \`${x.cam}\``}\n` +
                    `> Pic: \`${x.pic}\``;
            });

            pageTotal = Math.ceil(leaderboard.length / 10);
            const allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('🔈・Leaderboard Vocal (#TOP 10)')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `L'embed se mettra à jour tous les 15 secondes`,
                    iconURL: bot.user.displayAvatarURL({ dynamic: true })
                })

                return embed
            }

            await msg.edit({ content: null, embeds: [allEmbed(1)]})
        }, 15000)

        setInterval(async () => {
            let leaderboard = [];
            for (let i = 0; i < guildList.length; ++i) {
                let g = guildList.map(x => x)[i];
                const req = bot.functions.checkGuild(bot, g.id)
                if(JSON.parse(req.lbMessage).messages !== 0) {
                    leaderboard.push({
                        name: g.name,
                        id: g.id,
                        member: g.memberCount,
                        vanityUrl: g.vanityURLCode ? `https://discord.gg/${g.vanityURLCode}` : `https://discord.gg/VAHYJHNKfn`,
                        NbMSG: JSON.parse(req.lbMessage).messages,
                        contributors: JSON.parse(req.lbMessage).contributor.length
                    });
                }
            }

            leaderboard.sort((a, b) => b.NbMSG - a.NbMSG).slice(10);

            let counter = -1;

            let description = leaderboard.map((x, i) => {
                counter++
                return `\`${medals[counter] ? medals[counter] : counter }.\` [${x.name}](${x.vanityUrl}) (\`${x.member} membres\`):\n` +
                `> Messages: \`${x.NbMSG}\` (\`${x.contributors} contributeur(s)\`)\n`
            });

            pageTotal = Math.ceil(leaderboard.length / 10);
            const allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('💬・Leaderboard Messages (#TOP 10)')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `L'embed se mettra à jour tous les 15 secondes`,
                    iconURL: bot.user.displayAvatarURL({ dynamic: true })
                })

                return embed
            }

            await msg2.edit({ content: null, embeds: [allEmbed(1)]})
        }, 15000)

        setInterval(async () => {
            let leaderboard = [];
            for (let i = 0; i < guildList.length; ++i) {
                let g = guildList.map(x => x)[i];
                const req = bot.functions.checkGuild(bot, g.id)
                if(JSON.parse(req.joins).join !== 0 && JSON.parse(req.joins).leave !== 0) {
                    leaderboard.push({
                        name: g.name,
                        id: g.id,
                        member: g.memberCount,
                        vanityUrl: g.vanityURLCode ? `https://discord.gg/${g.vanityURLCode}` : `https://discord.gg/VAHYJHNKfn`,
                        joins: JSON.parse(req.joins)
                    });
                }
            }

            leaderboard.sort((a, b) => (b.joins.join - b.joins.leave) - (a.joins.join - a.joins.leave)).slice(10);

            let counter = -1;

            let description = leaderboard.map((x, i) => {
                counter++
                return `\`${medals[counter] ? medals[counter] : counter }.\` [${x.name}](${x.vanityUrl}) (\`${x.member} membres\`):\n` +
                `> Joins: \`${x.joins.join} membres\`\n` +
                `> Leaves: \`${x.joins.leave} membres\`\n`
            });

            pageTotal = Math.ceil(leaderboard.length / 10);
            allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('・Leaderboard Joins (#TOP 10)')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `L'embed se mettra à jour tous les 15 secondes`,
                    iconURL: bot.user.displayAvatarURL({ dynamic: true })
                })

                return embed
            }
            await msg3.edit({ content: null, embeds: [allEmbed(1)]})
        }, 15000)
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}