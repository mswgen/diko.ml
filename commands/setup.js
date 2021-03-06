const Discord = require('discord.js');
module.exports = {
    name: 'setup',
    aliases: ['url', 'url설정', '설정', 'add'],
    description: '현재 이 서버의 url을 설정하거나 변경할 수 있어요.',
    category: 'url',
    usage: '랜덤 url의 경우: d!setup\n커스텀 url의 경우 d!setup <커스텀 링크>',
    run: async (client, message, args) => {
        function urlGen (length) {
            var newURL = '';
            let chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            for (var i = 0; i < length; i++) {
                newURL += chars[Math.floor(Math.random() * chars.length)];
            }
            return newURL;
        }
        if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id != '647736678815105037') return message.channel.send('서버 관리 권한이 필요해요.');
        if (!message.guild.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text')) return message.channel.send('저에게 초대 링크 권한을 주고 다시 해보세요.');
        if (!args[1]) {
            var newURL = '';
            while (true) {
                newURL = urlGen(4);
                if (!await client.db.findOne({url: newURL})) break;
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
                            .setDescription('`d!remove`를 이용해 URL을 삭제하거나 `d!setup <커스텀 링크>`를 이용해 커스텀 링크를 만들 수 있어요!')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if ((await client.db.findOne({_id: message.guild.id}))) {
                            await client.db.deleteOne({_id: message.guild.id});
                        }
                        await client.db.insertOne({_id: message.guild.id, url: newURL});
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
            if (await client.db.findOne({url: newURL})) return message.channel.send('이미 이 URL을 누군가가 사용하고 있어요.');
            if (decodeURIComponent(newURL).includes('style.css') || decodeURIComponent(newURL).includes('stats') || decodeURIComponent(newURL).includes('amp') || decodeURIComponent(newURL).includes('robots.txt')) return message.channel.send('이 url은 내부 파일 때문에 사용할 수 없어요.');
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
                            .setDescription('`d!remove`를 이용해 URL을 삭제할 수 있어요!')
                            .spliceFields(0, 1)
                            .addField('새 URL', `https://diko.ml/${newURL}`);
                        m.edit(embed);
                        if ((await client.db.findOne({_id: message.guild.id}))) {
                            await client.db.deleteOne({_id: message.guild.id});
                        }
                        await client.db.insertOne({_id: message.guild.id, url: newURL});
                    } else {
                        embed.setColor("RANDOM")
                            .setTitle('URL 설정(변경)이 취소되었어요')
                            .spliceFields(0, 1);
                        m.edit(embed);
                    }
                });
            });
        }
    }
}