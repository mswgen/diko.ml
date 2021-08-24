import Discord from 'discord.js';
import Bot from '../Bot';
import axios from 'axios';
export default {
    name: 'now',
    run: async (client: Bot, interaction: any) => {
        let x = await client.db!.findOne({ _id: interaction.guild_id });
        if (!x) {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: `이 서버에는 url이 등록되어있지 않아요.`
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                embeds: [
                    new Discord.MessageEmbed()
                        .setTitle(`${client.guilds.cache.get(interaction.guild_id)!.name}의 url`)
                        .setDescription(`https://diko.ml/${(await client.db!.findOne({ _id: interaction.guild_id })).url}`)
                        .setColor('RANDOM')
                        .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.webp?size=2048` : `https://cdn.discordapp.com/embed/avatars/${Number(interaction.member.user.discriminator) % 5}.png`)
                        .setTimestamp()
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
}