import Discord from 'discord.js';
import Bot from '../Bot';
import axios from 'axios';
import functions from '../functions';
export default {
    name: 'ping',
    run: async (client: Bot, interaction: any) => {
        const embed = new Discord.MessageEmbed()
            .setTitle('Pinging...')
            .setColor('RANDOM')
            .setTimestamp()
        let m = (await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
            embeds: [embed]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })).data;
        embed.setTitle('PONG!')
            .setColor('RANDOM')
            .addField('Latency', `${Math.floor(Number(new Date()) - functions.snow2unix(interaction.id))}ms`)
            .addField('API Latency', `${client.ws.ping}ms`)
            .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.webp?size=2048` : `https://cdn.discordapp.com/embed/avatars/${Number(interaction.member.user.discriminator) % 5}.png`)
            .setTimestamp()
            .setThumbnail('https://i.imgur.com/1Gk4tOj.png')
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${m.id}`, {
                embeds: [embed]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    }
}