const Discord = require('discord.js');
module.exports = {
    name: 'help',
    aliases: ['도움', '도움말'],
    description: '봇의 도움말을 볼 수 있어요.',
    usage: '전체 명령어 보기: !help\n명령어 상세보기: !help <명령어 이름>',
    run: async (client, message, args, db) => {
        if (args[1]) {
            let cmd = client.commands.get(args[1]);
            if (!cmd) {
                message.channel.send('해당 명령어가 없어요. `!help`를 입력해 모든 명령어를 확인해보세요.');
            } else {
                const embed = new Discord.MessageEmbed()
                    .setTitle(cmd.name)
                    .setColor('RANDOM')
                    .addField('Aliases', cmd.aliases.map(x => `\`${x}\``).join(', '))
                    .addField('Usage', cmd.usage)
                    .setFooter(message.author.tag, message.author.avatarURL({
                        dynamic: true,
                        format: 'jpg',
                        size: 2048
                    }))
                    .setTimestamp();
                message.channel.send(embed);
            }
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle(`${client.user.username} 도움말`)
                .setColor('RANDOM')
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
                .setDescription(client.commands.map(x => `\`${x.name}\``).join(', '));
            message.channel.send(embed);
        }
    }
}