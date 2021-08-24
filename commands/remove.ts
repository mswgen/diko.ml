import Discord from 'discord.js';
import Bot from '../Bot';
import axios from 'axios';
export default {
    name: 'remove',
    run: async (client: Bot, interaction: any) => {
        const msgMember: Discord.GuildMember = client.guilds.cache.get(interaction.guild_id)!.member(interaction.member.user.id)!;
        if (!msgMember.hasPermission('MANAGE_GUILD') && interaction.member.user.id != '647736678815105037') {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: `서버 관리 권한이 필요해요.`
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return;
        }
        if (!(await client.db!.findOne({ _id: interaction.guild_id }))) {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: '이 서버에는 URL이 등록되어있지 않아요.'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return;
        }
        const randval = Math.floor(Math.random() * 1000000)
        const embed = new Discord.MessageEmbed()
            .setTitle('URL을 삭제할까요?')
            .setColor('RANDOM')
            .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.webp?size=2048` : `https://cdn.discordapp.com/embed/avatars/${Number(interaction.member.user.discriminator) % 5}.png`)
            .setTimestamp()
        const prompt = await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
            embeds: [embed],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        custom_id: `noremove-${randval}`,
                        style: 4,
                        label: '취소'
                    },
                    {
                        type: 2,
                        custom_id: `remove-${randval}`,
                        style: 3,
                        label: '확인'
                    }
                ]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        async function listenToMessageComponent() {
            client.once('raw', async data => {
                if (data.op != 0 || data.t != 'INTERACTION_CREATE' || data.d.type != 3 || data.d.data.component_type != 2 || !data.d.member || data.d.member.user.id != interaction.member.user.id) return await listenToMessageComponent();
                if (data.d.data.custom_id == `remove-${randval}`) {
                    await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
                        type: 7
                    });
                    embed.setColor("RANDOM")
                        .setTitle('URL이 삭제되었어요')
                        .setDescription('언제든지 `/setup`을 이용해 URL을 다시 설정할 수 있어요');
                    await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${prompt.data.id}`, {
                        embeds: [embed]
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    await client.db!.deleteOne({ _id: interaction.guild_id });
                } else if (data.d.data.custom_id == `noremove-${randval}`) {
                    embed.setColor("RANDOM")
                        .setTitle('URL 삭제가 취소되었어요')
                    await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${prompt.data.id}`, {
                        embeds: [embed]
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } else {
                    return await listenToMessageComponent();
                }
            });
        }
        await listenToMessageComponent()
    }
}