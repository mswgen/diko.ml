const Discord = require('discord.js');
const axios = require('axios').default;
module.exports = {
    name: 'help',
    aliases: ['도움', '도움말'],
    description: '봇의 도움말을 볼 수 있어요.',
    category: 'other',
    usage: '전체 명령어 보기: d!help\n명령어 상세보기: d!help <명령어 이름>',
    run: async (client, message, args, db) => {
        if (args[1]) {
            let cmd = client.commands.get(args[1]);
            if (!cmd) {
                message.channel.send('해당 명령어가 없어요. `d!help`를 입력해 모든 명령어를 확인해보세요.');
            } else {
                const embed = new Discord.MessageEmbed()
                    .setTitle(cmd.name)
                    .setColor('RANDOM')
                    .addField('Aliases', cmd.aliases.map(x => `\`${x}\``).join(', '))
                    .addField('Description', cmd.description)
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
                .setDescription('자세한 점보는 d!help <커멘드 이름>을 입력해보세요.')
            for (let category of client.categories.array()) {
                embed.addField(category, client.commands.filter(x => x.category == category).map(x => `\`${x.name}\``).join(', '));
            }
            message.channel.send(embed);
            const embed2 =  new Discord.MessageEmbed()
                .setColor('DARK_VIVID_PINK')
                .setDescription('[하트 누르기](https://koreanbots.dev/bots/717307994861469766)')
                .setFooter(message.author.tag, message.author.avatarURL({
                    dynamic: true,
                    format: 'jpg',
                    size: 2048
                }))
                .setTimestamp();
            axios.get(`https://api.koreanbots.dev/bots/voted/${message.author.id}`, {
                headers: {
                    token: process.env.KOREANBOTS
                }
            }).then(res => {
                if (res.data.voted == true) {
                    embed2.setTitle('❤를 눌러주셔서 감사합니다!');
                } else {
                    embed2.setTitle('koreanbots에서 ❤를 눌러주세요!');
                }
                message.channel.send(embed2);
            });
        }
    }
}