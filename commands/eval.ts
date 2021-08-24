import Discord from 'discord.js';
import util from 'util';
import Bot from '../Bot';
import axios from 'axios';
import FormData from 'form-data';
export default {
    name: 'eval', 
    run: async (client: Bot, interaction: any) => {
        if (!client.devs.includes(interaction.member.user.id)) {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: `${client.user!.username} 개발자만 사용할 수 있어요.`
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return;
        }
        let input = interaction.data.options.find((x: any) => x.name == 'code').value;
        if (!input) {
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: `내용을 써 주세요!`
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return;
        }
        const randval = Math.floor(Math.random() * 1000000)
        const initialResp = await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
            embeds: [
                new Discord.MessageEmbed()
                    .setTitle(`Evaling...`)
                    .setColor(0xffff00)
                    .addField('Input', '```js\n' + interaction.data.options[0].value + '\n```')
                    .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${interaction.member.user.discriminator % 5}.png`)
                    .setTimestamp()
            ]
        });
        try {
            const code = `const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');
const ascii = require('ascii-table');
const os = require('os');
const axios = require('axios').default;
const dotenv = require('dotenv');
const http = require('http');
const qs = require('querystring');
const url = require('url');
const mongodb = require('mongodb');
${input}`;
            let output: string = eval(code);
            let type = typeof output;
            if (typeof output !== "string") {
                output = util.inspect(output);
            }
            let _output = `${output.length >= 1020 ? `${output.split('').reverse().slice(0, 1010).reverse().join('')}\n...` : output}`.replace(new RegExp(process.env.TOKEN!, 'gi'), 'Secret');
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${initialResp.data.id}`, {
                embeds: [
                    new Discord.MessageEmbed()
                        .setTitle('Eval result')
                        .setColor(0x00ffff)
                        .addField('Input', '```js\n' + interaction.data.options[0].value + '\n```')
                        .addField('Output', '```js\n' + _output + '\n```')
                        .addField('Type', '```js\n' + type + '\n```')
                        .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${interaction.member.user.discriminator % 5}.png`)
                        .setTimestamp()
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: '메세지 삭제',
                                custom_id: `delete-${randval}`,
                                style: 2
                            }
                        ]
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (output.length >= 1020) {
                const outFile = new FormData();
                outFile.append('file', Buffer.from(output.replace(new RegExp(process.env.TOKEN!, 'gi'), 'Secret')), { contentType: 'text/plain', filename: 'output.txt' });
                await axios.post(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}`, outFile.getBuffer(), {
                    headers: outFile.getHeaders()
                });
            }
            async function listenToMessageComponent() {
                client.once('raw', async data => {
                    if (data.op != 0 || data.t != 'INTERACTION_CREATE' || data.d.type != 3 || data.d.data.custom_id != `delete-${randval}` || data.d.data.component_type != 2 || !data.d.member || data.d.member.user.id != interaction.member.user.id) return listenToMessageComponent()
                    await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
                        type: 6
                    })
                    await axios.delete(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${initialResp.data.id}`)
                })
            }
            await listenToMessageComponent()
        } catch (err: any) {
            let _error = `${err.length >= 1020 ? `${err.split('').reverse().slice(0, 1010).reverse().join('')}\n...` : err}`.replace(new RegExp(process.env.TOKEN!, 'gi'), 'Secret');
            await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${initialResp.data.id}`, {
                embeds: [
                    new Discord.MessageEmbed()
                        .setTitle('Eval error...')
                        .setColor(0xff0000)
                        .addField('Input', '```js\n' + interaction.data.options[0].value + '\n```')
                        .addField('Error', '```js\n' + _error + '\n```')
                        .setFooter(`${interaction.member.user.username}#${interaction.member.user.discriminator}`, interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${interaction.member.user.discriminator % 5}.png`)
                        .setTimestamp()
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: '메세지 삭제',
                                custom_id: `delete-${randval}`,
                                style: 2
                            }
                        ]
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (err.length >= 1020) {
                const errFile = new FormData();
                errFile.append('file', Buffer.from(err.replace(new RegExp(process.env.TOKEN!, 'gi'), 'Secret')), { contentType: 'text/plain', filename: 'output.txt' });
                await axios.post(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}`, errFile.getBuffer(), {
                    headers: errFile.getHeaders()
                });
            }
            async function listenToMessageComponent() {
                client.once('raw', async data => {
                    if (data.op != 0 || data.t != 'INTERACTION_CREATE' || data.d.type != 3 || data.d.data.custom_id != `delete-${randval}` || data.d.data.component_type != 2 || !data.d.member || data.d.member.user.id != interaction.member.user.id) return listenToMessageComponent()
                    await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
                        type: 6
                    })
                    await axios.delete(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/${initialResp.data.id}`)
                })
            }
            await listenToMessageComponent()
        }
    }
}