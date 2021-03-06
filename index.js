const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const url = require('url');
const fs = require('fs');
const client = new Discord.Client();
client.config = require('./assets/config.json');
const os = require('os');
const axios = require('axios');
const ascii = require('ascii-table');
const fn = require('./functions.js');
const table = new ascii();
const colorthief = require('colorthief');
const mongoDB = require('mongodb');
const DBClient = new mongoDB.MongoClient(`mongodb+srv://user:${process.env.DB_PASS}@dikoml.3ietb.mongodb.net/dikoml?retryWrites=true&w=majority`, {
    useNewUrlParser: true
});
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = new Discord.Collection();
client.db = undefined;
DBClient.connect().then(() => {
    client.db = DBClient.db('dikoml').collection('main');
});
function componentToHex (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
/*
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(process.env.CERTKEY, 'base64'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
   }
   */
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
                        name: 'd!help 입력',
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
        client.commands.get(args[0]).run(client, message, args);
    } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args);
    }
    message.channel.stopTyping(true);
});
client.on('guildDelete', async guild => {
    if ((await client.db.findOne({_id: guild.id}))) {
        await client.db.deleteOne({_id: guild.id});
    }
});
const server = http.createServer(/*{
    key: decrypt({
        iv: process.env.CERTIFICATE,
        encryptedData: fs.readFileSync('./key.pem')
    }),
    cert: fs.readFileSync('./cert.pem')
}, */async (req, res) => {
    const io = require('socket.io')(server);
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
    } else if (await client.db.findOne({url: parsed.pathname.substr(1)})) {
      let color;
      if (client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).iconURL()) {
        color = await colorthief.getColor(client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).iconURL({format: 'png'}), 10);
      } else {
        color = [72, 89, 218];
      }
      if (client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).member(client.user).hasPermission('MANAGE_GUILD')) {
        const invites = await client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).fetchInvites();
        if (invites.some(x => !x.temporary && x.channel.type == 'text')) {
            fs.readFile('./assets/static/join.html', 'utf8', async (err, data) => {
                res.writeHead(200);
                res.end(data
                    .replace(/{guild_name}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).name)
                    .replace(/{online}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).members.cache.filter(x => x.presence.status != 'offline').size)
                    .replace(/{members}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).memberCount)
                    .replace(/{guild_icon}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).iconURL())
                    .replace(/{url}/gi, invites.filter(x => !x.temporary && x.channel.type == 'text').random().url)
                    .replace(/{color}/gi, rgbToHex(color[0], color[1], color[2]))
                );
            });
            return;
        }
      }
        client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).channels.cache.filter(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text').random().createInvite({
            maxAge: 0,
            maxUses: 0
        }).then(inv => {
            fs.readFile('./assets/static/join.html', 'utf8', async (err, data) => {
                res.writeHead(200);
                res.end(data
                    .replace(/{guild_name}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).name)
                    .replace(/{online}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).members.cache.filter(x => x.presence.status != 'offline').size)
                    .replace(/{members}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).memberCount)
                    .replace(/{guild_icon}/gi, client.guilds.cache.get((await client.db.findOne({url: parsed.pathname.substr(1)}))._id).iconURL())
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
    io.on('connection', socket => {
        socket.on('req', () => {
            socket.emit('res', [
                {
                    name: '업타임',
                    content: fn.countTime(client.uptime)
                },
                {
                    name: '핑',
                    content: `${client.ws.ping}ms`
                },
                {
                    name: 'CPU 모델',
                    content: os.cpus()[1].model
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
                    content: fn.getOs(client) || process.platform
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
});
client.login(process.env.TOKEN);
server.listen(4000);