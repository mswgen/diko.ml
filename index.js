const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const url = require('url');
const fs = require('fs');
const list = require('./list.json');
const client = new Discord.Client();
const axios = require('axios');
dotenv.config({
    path: './.env'
});
client.on('ready', () => {
    console.log(`Login ${client.user.username}\n---------------------`);
    setInterval(() => {
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: '!url 입력해서 초대 링크 만들기',
                        type: 'PLAYING'
                    }
                });
                break;
            case 1:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `${client.guilds.cache.size}개의 서버`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 2:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `${client.users.cache.size}명의 유저`,
                        type: 'PLAYING'
                    }
                });
                break;
        }
    }, 5000);
    setInterval(() => {
        axios.get('https://diko.ga').then();
    }, 600000)
});
client.on('message', message => {
    if (message.content.startsWith('!url')) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('서버 관리 권한이 필요해요.');
        var args = message.content.slice(1).trim().split(' ');
        if (!args[1]) {
            var newURL = '';
            let chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            for (var i = 0; i < 4; i++) {
                newURL += chars[Math.floor(Math.random() * chars.length)];
            }
            const embed = new Discord.MessageEmbed()
                .setTitle('URL을 설정(변경)할까요?')
                .setColor('RANDOM')
                .addField('새 URL', `https://diko.ml/${newURL}`)
                .setFooter(message.author.tag, message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
                .setTimestamp()
                .setThumbnail(message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
            message.channel.send(embed).then(async m => {
                await m.react('✅');
                await m.react('❌');
                const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
                const collector = m.createReactionCollector(filter, {
                    time: 30000,
                    max: 1
                });
                collector.on('end', collected => {
                    if (collected.first() && collected.first().emoji.name == '✅') {
                        embed.setColor("RAMDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if (list.urls.find(x => x.guild == message.guild.id)) {
                            list.urls.find(x => x.guild == message.guild.id).code = newURL;
                        } else {
                            list.urls.push({
                                code: newURL,
                                guild: message.guild.id
                            });
                        }
                        fs.writeFile('./list.json', JSON.stringify(list), () => {});
                    } else {
                        embed.setColor("RAMDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
                            .spliceFields(0, 1);
                        m.edit(embed);
                    }
                });
            });
        } else {
            let newURL = encodeURIComponent(args.slice(1).join(' '));
            if (list.urls.find(x => x.code == newURL)) return message.channel.send('이미 이 URL을 누군가가 사용하고 있어요.');
            const embed = new Discord.MessageEmbed()
                .setTitle('URL을 설정(변경)할까요?')
                .setColor('RANDOM')
                .addField('새 URL', `https://diko.ml/${newURL}`)
                .setFooter(message.author.tag, message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
                .setTimestamp()
                .setThumbnail(message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
            message.channel.send(embed).then(async m => {
                await m.react('✅');
                await m.react('❌');
                const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
                const collector = m.createReactionCollector(filter, {
                    time: 30000,
                    max: 1
                });
                collector.on('end', collected => {
                    if (collected.first() && collected.first().emoji.name == '✅') {
                        embed.setColor("RAMDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if (list.urls.find(x => x.guild == message.guild.id)) {
                            list.urls.find(x => x.guild == message.guild.id).code = newURL;
                        } else {
                            list.urls.push({
                                code: newURL,
                                guild: message.guild.id
                            });
                        }
                        fs.writeFile('./list.json', JSON.stringify(list), () => {});
                    } else {
                        embed.setColor("RAMDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
                            .spliceFields(0, 1);
                        m.edit(embed);
                    }
                });
            });
        }
    }
});
client.on('guildDelete', guild => {
    if (list.urls.find(x => x.guild == guild.id)) {
        list.urls.splice(list.urls.indexOf({
            code: list.urls.find(x => x.guild == guild.id).code,
            guild: guild.id
        }), 1);
        fs.writeFile('./list.json', JSON.stringify(list), () => {});
    }
});
const server = http.createServer((req, res) => {
    let parsed = url.parse(req.url, true);
    if (parsed.pathname == '/') {
        res.writeHead(302, {
            'Location': 'https://discord.com/api/oauth2/authorize?client_id=717307994861469766&permissions=8&scope=bot'
        });
        res.end();
    } else if (list.urls.find(x => x.code == parsed.pathname.substr(1))) {
            client.guilds.cache.get(list.urls.find(x => x.code == parsed.pathname.substr(1)).guild).channels.cache.filter(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text').random().createInvite({
                maxAge: 0,
                maxUses: 0
            }).then(inv => {
                res.writeHead(302, {
                    'Location': inv.url
                });
                res.end();
            });
        } else {
        fs.readFile('./404.html', 'utf8', (err, data) => {
            res.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    }
});
client.login(process.env.TOKEN);
server.listen(4000);