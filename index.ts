import Discord from 'discord.js';
import http from 'http';
import dotenv from 'dotenv';
import url from 'url';
import fs from 'fs';
import Bot from './Bot';
const client = new Bot();
import os from 'os';
import axios from 'axios';
import ascii from 'ascii-table';
import functions from './functions.js';
const table = new ascii();
import colorthief from 'colorthief';
import * as mongodb from 'mongodb';
import socketio from 'socket.io';
const DBClient = new mongodb.MongoClient(`mongodb+srv://user:${process.env.DB_PASS}@dikoml.3ietb.mongodb.net/dikoml?retryWrites=true&w=majority`);
client.commands = new Discord.Collection();
client.db = undefined;
DBClient.connect().then(() => {
    client.db = DBClient.db('dikoml').collection('main');
});
function componentToHex (c: number) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex (r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
dotenv.config();
table.setHeading('Command', 'Load Status');
fs.readdir('./dist/commands/', (err, list) => {
    for (let file of list.filter(x => x.endsWith('.js'))) {
        try {
            let pull = require(`./commands/${file}`).default;
            if (pull.name && pull.run) {
                table.addRow(file, '✅');
                client.commands.set(pull.name, pull);
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
    console.log(`Login ${client.user!.username}\n-------------------------------`);
    setInterval(() => {
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                client.user!.setPresence({
                    status: 'online',
                    activity: {
                        name: '/setup 입력',
                        type: 'PLAYING'
                    }
                });
                break;
            case 1:
                client.user!.setPresence({
                    status: 'online',
                    activity: {
                        name: `${client.guilds.cache.size}개의 서버`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 2:
                client.user!.setPresence({
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
        axios.get('https://diko.ml').then();
    }, 600000)
    setInterval(() => {
        axios.post('https://api.koreanbots.dev/bots/servers', {
            servers: client.guilds.cache.size
        }, {
            headers: {
                'Content-Type': 'application/json',
                token: process.env.KOREANBOTS
            }
        });
    }, 120000);
});
client.on('guildDelete', async guild => {
    if ((await client.db?.findOne({_id: guild.id}))) {
        await client.db?.deleteOne({_id: guild.id});
    }
});
client.on('raw', async data => {
    if (data.op != 0 || data.t != 'INTERACTION_CREATE' || data.d.type != 2 || !data.d.member || data.d.member.user.bot) return;
    let cmd = data.d.data.name;
    if (client.commands.get(cmd)) {
        await axios.post(`https://discord.com/api/v9/interactions/${data.d.id}/${data.d.token}/callback`, {
            type: 5
        });
        await client.commands.get(cmd)?.run(client, data.d);
    }
});
const server = http.createServer(async (req, res) => {
    let parsed = url.parse(req.url!, true);
    if (req.headers['user-agent']!.indexOf("MSIE") > -1 || req.headers['user-agent']!.indexOf("Trident") > -1) {
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
    } else if (parsed.pathname == '/stats') {
        fs.readFile('./assets/static/stats.html', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
        })
    } else if (parsed.pathname == '/amp') {
        fs.readFile('./assets/static/index.amp.html', 'utf8', (err, data) => {
            res.writeHead(200);
            res.end(data);
        });
    } else if (parsed.pathname == '/robots.txt') {
        fs.readFile('./assets/static/robots.txt', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            res.end(data);
        });
    } else if (parsed.pathname == '/sitemap.xml') {
        fs.readFile('./assets/static/sitemap.xml', 'utf8', (err, data) => {
            res.writeHead(200, {
                'Content-Type': 'application/xml; charset=utf-8'
            });
            res.end(data);
        })
    } else if (await client.db!.findOne({url: parsed.pathname!.substr(1)})) {
      let color: Array<number> = [0, 0, 0];
      if (client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.iconURL()) {
        color = await colorthief.getColor(client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.iconURL({format: 'png'}), 10);
      } else {
        color = [72, 89, 218];
      }
      if (client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.member(client.user!)!.hasPermission('MANAGE_GUILD')) {
        const invites = await client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.fetchInvites();
        if (invites.some(x => !x.temporary && x.channel.type == 'text')) {
            fs.readFile('./assets/static/join.html', 'utf8', async (err, data) => {
                res.writeHead(200);
                res.end(data
                    .replace(/{guild_name}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.name)
                    .replace(/{online}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.members.cache.filter(x => x.presence.status != 'offline').size.toString())
                    .replace(/{members}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.memberCount.toString())
                    .replace(/{guild_icon}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.iconURL() || `https://cdn.discordapp.com/embed/avatars/0.png`)
                    .replace(/{url}/gi, invites.filter(x => !x.temporary && x.channel.type == 'text').random().url)
                    .replace(/{color}/gi, rgbToHex(color[0], color[1], color[2]))
                );
            });
            return;
        }
      }
        client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.channels.cache.filter(x => x.permissionsFor(client.user!)!.has('CREATE_INSTANT_INVITE') && x.type == 'text').random().createInvite({
            maxAge: 0,
            maxUses: 0
        }).then(inv => {
            fs.readFile('./assets/static/join.html', 'utf8', async (err, data) => {
                res.writeHead(200);
                res.end(data
                    .replace(/{guild_name}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.name)
                    .replace(/{online}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.members.cache.filter(x => x.presence.status != 'offline').size.toString())
                    .replace(/{members}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.memberCount.toString())
                    .replace(/{guild_icon}/gi, client.guilds.cache.get((await client.db!.findOne({url: parsed.pathname!.substr(1)}))._id)!.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png')
                    .replace(/{url}/gi, inv.url)
                    .replace(/{color}/gi, rgbToHex(color[0], color[1], color[2]))
                )
            });
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
const io = new socketio.Server(server);
io.on('connection', socket => {
    socket.on('req', () => {
        socket.emit('res', [
            {
                name: '업타임',
                content: functions.countTime(client.uptime!)
            },
            {
                name: '핑',
                content: `${client.ws.ping}ms`
            },
            {
                name: 'CPU 모델',
                content: os.cpus()[0].model
            },
            {
                name: '아키덱쳐',
                content: os.arch()
            },
            {
                name: 'CPU 코어 수',
                content: os.cpus().length
            },
            {
                name: '운영 체제',
                content: functions.getOs(client) || process.platform
            },
            {
                name: 'RAM 사용량',
                content: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB`
            },
            {
                name: '서버 수',
                content: `${client.guilds.cache.size}개`
            },
            {
                name: '유저 수',
                content: `${client.users.cache.size}명`
            },
            {
                name: '채널 수',
                content: `${client.channels.cache.size}개(채팅 채널 ${client.channels.cache.filter(x => x.type == 'text').size}개, 음성 채널 ${client.channels.cache.filter(x => x.type == 'voice').size}개)`
            }
        ]);
    });
});
client.login(process.env.TOKEN);
server.listen(4000);