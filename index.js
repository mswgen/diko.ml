const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const url = require('url');
const fs = require('fs');
const client = new Discord.Client();
const axios = require('axios');
const { VultrexDB } = require('vultrex.db');
const db = new VultrexDB({
    provider: 'sqlite',
    table: 'index',
    fileName: './db/index'
});
db.connect(() => console.log('DB connected'));
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
                        name: '!help 입력',
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
                        name: `${client.users.cache.filter(x => !x.bot).size}명의 유저`,
                        type: 'PLAYING'
                    }
                });
                break;
        }
    }, 5000);
    setInterval(() => {
        axios.get('https://diko.ml').then();
    }, 600000)
});
client.on('message', async message => {
    if (message.content.startsWith('!url')) {
        if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id != '647736678815105037') return message.channel.send('서버 관리 권한이 필요해요.');
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
                collector.on('end', async collected => {
                    if (collected.first() && collected.first().emoji.name == '✅') {
                        embed.setColor("RANDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .setDescription('`!remove`를 이용해 URL을 삭제하거나 `!url <커스텀 링크>`를 이용해 커스텀 링크를 만들 수 있어요!')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if ((await db.getAll()).find(x => x.value == message.guild.id)) {
                            await db.delete((await db.getAll()).find(x => x.value == message.guild.id).key);
                        }
                        await db.set(newURL, message.guild.id);
                    } else {
                        embed.setColor("RANDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
                            .spliceFields(0, 1);
                        m.edit(embed);
                    }
                });
            });
        } else {
            let newURL = encodeURIComponent(args.slice(1).join(' '));
            if (await db.get(newURL)) return message.channel.send('이미 이 URL을 누군가가 사용하고 있어요.');
            if (decodeURIComponent(newURL) == 'style.css') return message.channel.send('이 url은 내부 파일 때문에 사용할 수 없어요.');
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
                collector.on('end', async collected => {
                    if (collected.first() && collected.first().emoji.name == '✅') {
                        embed.setColor("RANDOM")
                            .setTitle('URL이 설정(변경)되었어요')
                            .setDescription('`!remove`를 이용해 URL을 삭제할 수 있어요!')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if ((await db.getAll()).find(x => x.value == message.guild.id)) {
                            await db.delete((await db.getAll()).find(x => x.value == message.guild.id).key);
                        }
                        await db.set(newURL, message.guild.id);
                    } else {
                        embed.setColor("RANDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
                            .spliceFields(0, 1);
                        m.edit(embed);
                    }
                });
            });
        }
    } else if (message.content == '!remove') {
        if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id != '647736678815105037') return message.channel.send('서버 관리 권한이 필요해요.');
        if (!(await db.getAll()).find(x => x.value == message.guild.id)) return message.channel.send('이 서버에는 URL이 등록되어있지 않아요.');
        const embed = new Discord.MessageEmbed()
                .setTitle('URL을 삭제할까요?')
                .setColor('RANDOM')
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
                collector.on('end', async collected => {
                    if (collected.first() && collected.first().emoji.name == '✅') {
                        embed.setColor("RANDOM")
                            .setTitle('URL이 삭제되었어요')
                            .setDescription('언제든지 `!url`을 이용해 URL을 다시 설정할 수 있어요');
                        m.edit(embed);
                        await db.delete((await db.getAll()).find(x => x.value == message.guild.id).key);
                    } else {
                        embed.setColor("RANDOM")
                            .setTitle('URL 삭제가 취소되었어요')
                        m.edit(embed);
                    }
                });
            });
    } else if (message.content == '!help') {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`${client.user.username} 도움말`)
            .setColor('RANDOM')
            .addField('!url', '서버의 url을 등록하거나 변경해요. 뒤에 커스텀 링크를 적으면 커스텀 url도 만들 수 있어요.')
            .addField('!remove', '서버의 url을 삭제해요. 언제든시 다시 등록할 수 있어요.')
            .addField('!help', '지금 이거에요!')
            .addField('!now', '현재 이 서버의 URl을 볼 수 있어요.')
            .setFooter(message.author.tag, message.author.avatarURL({
                dynamic: true,
                format: 'jpg',
                size: 2048
            }))
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL({
                dynamic: true,
                format: 'jpg',
                size: 2048
            }))
        );
    } else if (message.content == '!now') {
        let x = (await db.getAll()).find(x => x.value == message.guild.id);
        if (!x) {
            message.channel.send('이 서버에는 url이 등록되어있지 않아요.');
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`${message.guild.name}의 url`)
                .setDescription(`https://diko.ml/${(await db.getAll()).find(x => x.value == message.guild.id).key}`)
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
                .setTimestamp()
            );
        }
    }
});
client.on('guildCreate', async guild => {
    if (!guild.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE'))) {
        await guild.owner.send(`초대 링크 만들기 권한이 없어서 방금 ${guild.name}에서 나갔어요.`);
        await guild.leave();
        return;
    }
    guild.owner.send(`${client.user.username} 봇을 초대해 주셔서 고마워요! \`!help\`를 입력해 도움말을 볼 수 있어요.

>>> **diko.ml 바로가기(봇 초대 링크): https://diko.ml **
`);
});
client.on('guildDelete', async guild => {
    if ((await db.getAll()).find(x => x.value == guild.id)) {
        await db.delete((await db.getAll()).find(x => x.value == guild.id).key);
    }
});
client.on('guildUpdate', async (_old, _new) => {
    if (!_new.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE'))) {
        await _new.owner.send(`초대 링크 만들기 권한이 없어서 방금 ${_new.name}에서 나갔어요.`);
        await _new.leave();
    }
});
const server = http.createServer(async (req, res) => {
    let parsed = url.parse(req.url, true);
    if (req.headers['user-agent'].indexOf("MSIE") > -1 || req.headers['user-agent'].indexOf("rv:11.0") > -1) {
        fs.readFile('./ie.html', 'utf8', (err, data) => {
            res.writeHead(400, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    }
    if (parsed.pathname == '/') {
        fs.readFile('./index.html', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    } else if (parsed.pathname == '/style.css') {
        fs.readFile('./style.css', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'text/css; charset=utf-8'
            });
            res.end(data);
        });
    } else if (await db.get(parsed.pathname.substr(1))) {
      if (client.guilds.cache.get(await db.get(parsed.pathname.substr(1))).member(client.user).hasPermission('MANAGE_GUILD')) {
        const invites = await client.guilds.cache.get(await db.get(parsed.pathname.substr(1))).fetchInvites();
        if (invites.some(x => !x.temporary && x.channel.type == 'text')) {
            res.writeHead(302, {
                'Location': invites.filter(x => !x.temporary && x.channel.type == 'text').random().url
            });
            res.end();
            return;
        }
      }
        client.guilds.cache.get(await db.get(parsed.pathname.substr(1))).channels.cache.filter(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text').random().createInvite({
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