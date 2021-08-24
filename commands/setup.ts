import Discord from 'discord.js';
import axios from 'axios';
import Bot from '../Bot';
export default {
    name: 'setup',
    run: async (client: Bot, interaction: any) => {
        function urlGen(length: number) {
            let newURL = '';
            let chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            for (var i = 0; i < length; i++) {
                newURL += chars[Math.floor(Math.random() * chars.length)];
            }
            return newURL;
        }
        const msgMember = client.guilds.cache.get(interaction.guild_id)!.member(interaction.member.user.id)!;
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
        if (!client.guilds.cache.get(interaction.guild_id)!.channels.cache.some((x: Discord.GuildChannel) => x.permissionsFor(client.user!)!.has('CREATE_INSTANT_INVITE') && x.type == 'text')) {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: '초대 링크 권한이 필요해요.'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        if (!interaction.data.options || !interaction.data.options.find((x: any) => x.name == 'url')) {
            let newURL = '';
            while (true) {
                newURL = urlGen(4);
                if (!await client.db!.findOne({ url: newURL })) break;
            }
            const randval = Math.floor(Math.random() * 1000000)
            const embed = new Discord.MessageEmbed()
                .setTitle('URL을 설정(변경)할까요?')
                .setColor('RANDOM')
                .addField('새 URL', `https://diko.ml/${newURL}`)
                .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.webp?size=2048` : `https://cdn.discordapp.com/embed/avatars/${Number(interaction.member.user.discriminator) % 5}.png`)
                .setTimestamp()
            const prompt = await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            custom_id: `nocreate-${randval}`,
                            style: 4,
                            label: '취소'
                        },
                        {
                            type: 2,
                            custom_id: `create-${randval}`,
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
                    if (data.d.data.custom_id == `create-${randval}`) {
                        await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
                            type: 7
                        });
                        embed.setColor("RANDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .setDescription('언제든지 `/remove`을 이용해 URL을 삭제할 수 있어요')
                            .spliceFields(0, 1)
                            .addField('새 URL', newURL);
                        await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${prompt.data.id}`, {
                            embeds: [embed]
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if ((await client.db!.findOne({ _id: interaction.guild_id }))) {
                            await client.db!.deleteOne({ _id: interaction.guild_id });
                        }
                        await client.db!.insertOne({ _id: interaction.guild_id, url: newURL });
                    } else if (data.d.data.custom_id == `nocreate-${randval}`) {
                        embed.setColor("RANDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
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
        } else {
            let newURL = encodeURIComponent(interaction.data.options.find((x: any) => x.name == 'url').value);
            if (await client.db!.findOne({ url: newURL })) {
                await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                    content: '이미 이 URL을 누군가가 사용하고 있어요.'
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }
            if (decodeURIComponent(newURL).includes('style.css') || decodeURIComponent(newURL).includes('stats') || decodeURIComponent(newURL).includes('amp') || decodeURIComponent(newURL).includes('robots.txt')) {
                await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                    content: '이 URL은 사용할 수 없어요.'
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }
            const randval = Math.floor(Math.random() * 1000000)
            const embed = new Discord.MessageEmbed()
                .setTitle('URL을 설정(변경)할까요?')
                .setColor('RANDOM')
                .addField('새 URL', `https://diko.ml/${newURL}`)
                .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.webp?size=2048` : `https://cdn.discordapp.com/embed/avatars/${Number(interaction.member.user.discriminator) % 5}.png`)
                .setTimestamp()
            const prompt = await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            custom_id: `nocreate-${randval}`,
                            style: 4,
                            label: '취소'
                        },
                        {
                            type: 2,
                            custom_id: `create-${randval}`,
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
                    if (data.d.data.custom_id == `create-${randval}`) {
                        await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
                            type: 7
                        });
                        embed.setColor("RANDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .setDescription('언제든지 `/remove`을 이용해 URL을 삭제할 수 있어요')
                            .spliceFields(0, 1)
                            .addField('새 URL', newURL);
                        await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${prompt.data.id}`, {
                            embeds: [embed]
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if ((await client.db!.findOne({ _id: interaction.guild_id }))) {
                            await client.db!.deleteOne({ _id: interaction.guild_id });
                        }
                        await client.db!.insertOne({ _id: interaction.guild_id, url: newURL });
                    } else if (data.d.data.custom_id == `nocreate-${randval}`) {
                        embed.setColor("RANDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
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
            await listenToMessageComponent();
        }
    }
}