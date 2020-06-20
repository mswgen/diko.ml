const Discord = require('discord.js');
module.exports = {
    name: 'remove',
    aliases: ['삭제', 'delete', 'url삭제'],
    description: '현재 이 서버의 url을 지울 수 있어요.',
    category: 'url',
    usage: '!remove',
    run: async (client, message, args, db) => {
        if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id != '647736678815105037') return message.channel.send('서버 관리 권한이 필요해요.');
        if (!message.guild.channels.cache.some(x => x.permissionsFor(client.user).has('CREATE_INSTANT_INVITE') && x.type == 'text')) return message.channel.send('저에게 초대 링크 권한을 주고 다시 해보세요.');
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
    }
}