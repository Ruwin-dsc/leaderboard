const Discord = require('discord.js');
const medals = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];
const discordSb = require('discord.js-selfbot-v13')
const client = new discordSb.Client({ checkUpdate: false });
client.login(require('../config.json').tokenSB)

exports.help = {
  name: 'leaderboard',
  aliases: ['lb'],
  description: 'Affiche les différents leaderboards.',
  use: 'lb <vocal/message>',
}
exports.run = async (bot, message, args, config) => {
    let page = 1, allEmbed, msg, pageTotal, bouton, bouton2, bouton3
    const guildList = []
    await bot.db.prepare('SELECT * FROM guild').all().forEach(async g => {
        const guild = await bot.guilds.fetch(g.id).catch(() => false) || await client.guilds.fetch(g.id).catch(() => false)
        if(guild) guildList.push(guild)
        }
    )

    msg = await message.channel.send({ content: `**Veuillez patienter... ⏳**` })

    if(args[0] == "vocal" || args[0] == "voc") {
        await wait(2000)

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
            allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('🔈・Leaderboard Vocal')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Demandé par ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })

                return embed
            }

            bouton = new Discord.ButtonBuilder()
            .setLabel('◀')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageBefore')
            .setDisabled(true);

            bouton2 = new Discord.ButtonBuilder()
            .setLabel(`${page}/${pageTotal == 0 ? 1 : pageTotal}`)
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId('page')
            .setDisabled(true);
            
            bouton3 = new Discord.ButtonBuilder()
            .setLabel('▶')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageAfter')
            .setDisabled(pageTotal == 1);

            await msg.edit({ content: null, embeds: [allEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(bouton, bouton2, bouton3)] });
    } else if(args[0] == "message" || args[0] == "msg") {
        
        await wait(2000)

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
            allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('💬・Leaderboard Messages')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Demandé par ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })

                return embed
            }

            bouton = new Discord.ButtonBuilder()
            .setLabel('◀')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageBefore')
            .setDisabled(true);

            bouton2 = new Discord.ButtonBuilder()
            .setLabel(`${page}/${pageTotal == 0 ? 1 : pageTotal}`)
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId('page')
            .setDisabled(true);
            
            bouton3 = new Discord.ButtonBuilder()
            .setLabel('▶')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageAfter')
            .setDisabled(pageTotal == 1);

            await msg.edit({ content: null, embeds: [allEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(bouton, bouton2, bouton3)] });
    } else if(args[0] == "join" || args[0] == "leave") {
        await wait(2000)

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
                `> Leaves: \`${x.joins.leave}\`\n`
            });

            pageTotal = Math.ceil(leaderboard.length / 10);
            allEmbed = (page) => {
                const start = (page - 1) * 10;
                const end = page * 10;
                const current = description.slice(start, end)
                const embed = new Discord.EmbedBuilder()
                .setDescription(`\n${current.join('\n\n')}`)
                .setTitle('・Leaderboard Joins')
                .setColor(0xFFFFFF)
                .setTimestamp()
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Demandé par ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })

                return embed
            }

            bouton = new Discord.ButtonBuilder()
            .setLabel('◀')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageBefore')
            .setDisabled(true);

            bouton2 = new Discord.ButtonBuilder()
            .setLabel(`${page}/${pageTotal == 0 ? 1 : pageTotal}`)
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId('page')
            .setDisabled(true);
            
            bouton3 = new Discord.ButtonBuilder()
            .setLabel('▶')
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId('pageAfter')
            .setDisabled(pageTotal == 1);

            await msg.edit({ content: null, embeds: [allEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(bouton, bouton2, bouton3)] });
    } else return msg.edit(`:x: Veuillez indiquer vocal/message/join !`)

    const filter = (i) => {
        if(i.user.id == message.author.id) {
            return true;
        } else {
            const embed = new Discord.EmbedBuilder()
            .setDescription(`:x: Vous n'avez pas l'autorisation d'intéragir avec ces boutons !`)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('Red')
            .setTimestamp();
            return i.reply({ embeds: [embed], ephemeral: true });
        }
    }

    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
        if(i.user.id !== message.author.id) return
        if(i.customId == 'pageBefore') {
            if(page > 1) {
                page--;
                bouton2.setLabel(`${page}/${pageTotal}`)

                await i.update({ embeds: [allEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(bouton.setDisabled(page == 1), bouton2, bouton3.setDisabled(pageTotal == page))] })
            }
        } else if(i.customId == 'pageAfter') {
            if (page < pageTotal) { 
                page++;
                bouton2.setLabel(`${page}/${pageTotal}`)

                await i.update({ embeds: [allEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(bouton.setDisabled(page == 1), bouton2, bouton3.setDisabled(pageTotal == page))] })
            }
        }
    })

    collector.on('end', async () => {
        if (msg.components) {
            msg.components.forEach((row) => {
                row.components.forEach((component) => {
                    component.data.disabled = true
                })
            })
            await msg.edit({ components: msg.components })
        }
    })


}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}