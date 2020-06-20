const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const url = require('url');
const fs = require('fs');
const client = new Discord.Client();
client.config = require('./assets/config.json');
const axios = require('axios');
const ascii = require('ascii-table');
const table = new ascii();
const { VultrexDB } = require('vultrex.db');
const db = new VultrexDB({
    provider: 'sqlite',
    table: 'index',
    fileName: './db/index'
});
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = new Discord.Collection();
db.connect().then(() => {
    console.log('DB connected');
});
dotenv.config({
    path: './.env'
});
table.setHeading('Command', 'Load Status');
fs.readdir('./commands/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./commands/${file}`);
            if (pull.name && pull.run && pull.aliases && pull.category) {
                table.addRow(file, '✅');
                for (let alias of pull.aliases) {
                    client.aliases.set(alias, pull.name);
                }
                client.commands.set(pull.name, pull);
                client.categories.set(pull.category, pull.category);
            } else {
                table.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) {
            table.addRow(file, `❌ -> ${e}`);
            continue;
        }
    }
    console.log(table.toString());
});
client.on('ready', () => {
    console.log(`Login ${client.user.username}\n-------------------------------`);
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
    if (message.author.bot) return;
    if (message.channel.type != 'text') return;
    console.log(`New Message
-------------------------------
${message.content}
-------------------------------
author: ${message.author.tag}(ID: ${message.author.id})
channel: ${message.channel.name}(ID: ${message.channel.id})
guild: ${message.guild.name}(ID: ${message.guild.id})
-------------------------------
-------------------------------
    `);
    if (!message.content.startsWith(client.config.prefix)) return;
    message.channel.startTyping(1);
    let args = message.content.substr(client.config.prefix.length).trim().split(' ');
    if (client.commands.get(args[0])) {
        client.commands.get(args[0]).run(client, message, args, db);
    } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args, db);
    }
    message.channel.stopTyping(true);
});
client.on('guildCreate', async guild => {
    if (!guild.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text')) {
        guild.owner.send(`${client.user.username} 봇을 초대해 주셔서 고마워요! \`d!help\`를 입력해 도움말을 볼 수 있어요.
        **참고: 초대 링크 권한이 없어서 url 설정을 할 수 없어요. 초대 링크 권한을 주면 url을 설정할 수 있어요. (재초대 X)**

>>> **diko.ml 바로가기: https://diko.ml **
`);
        return;
    }
    guild.owner.send(`${client.user.username} 봇을 초대해 주셔서 고마워요! \`d!help\`를 입력해 도움말을 볼 수 있어요.

>>> **diko.ml 바로가기: https://diko.ml **
`);
});
client.on('guildDelete', async guild => {
    if ((await db.getAll()).find(x => x.value == guild.id)) {
        await db.delete((await db.getAll()).find(x => x.value == guild.id).key);
    }
});
client.on('guildUpdate', async (_old, _new) => {
    if (!_new.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE'))) {
            _new.owner.send(`초대 링크 권한이 없어서 url이 삭제되었어요. 초대 링크 권한을 주면 url을 설정할 수 있어요. (재초대 X)
    
>>> **diko.ml 바로가기: https://diko.ml **
        `);
        if ((await db.getAll()).find(x => x.value == _new.id)) {
            await db.delete((await db.getAll()).find(x => x.value == _new.id).key);
        }
    }
});
const server = http.createServer(async (req, res) => {
    let parsed = url.parse(req.url, true);
    if (req.headers['user-agent'].indexOf("MSIE") > -1 || req.headers['user-agent'].indexOf("rv:11.0") > -1) {
        fs.readFile('./assets/static/ie.html', 'utf8', (err, data) => {
            res.writeHead(400, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    }
    if (parsed.pathname == '/') {
        fs.readFile('./assets/static/index.html', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    } else if (parsed.pathname == '/style.css') {
        fs.readFile('./assets/static/style.css', 'utf8', (err, data) => {
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
        fs.readFile('./assets/static/404.html', 'utf8', (err, data) => {
            res.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        });
    }
});
client.login(process.env.TOKEN);
server.listen(4000);