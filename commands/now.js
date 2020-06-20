const Discord = require('discord.js');
module.exports = {
    name: 'now',
    aliases: ['현재', '현재url'],
    description: '현재 이 서버의 url을 볼 수 있어요.',
    category: 'url',
    usage: 'd!now',
    run: async (client, message, args, db) => {
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
}