const Discord = require('discord.js');
const fs = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Command', 'Reload Status');
module.exports = {
    name: 'reload',
    aliases: ['ㄹㄹㄷ', '리로드', 'ㄱ디ㅐㅁㅇ', 'flfhem'],
    description: `봇의 모든 파일을 리로드해요.(개발자만 가능)`,
    category: 'owner',
    usage: '!reload',
    run: async (client, message, args, db) => {
        if (!client.config.owner.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있어요.`);
        const embed = new Discord.MessageEmbed()
            .setTitle(`${client.emojis.cache.find(x => x.name == 'loading')} ${client.user.username}의 파일을 리로드 중...(${client.commands.size}개)`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.avatarURL({
                dynamic: true,
                format: 'jpg',
                size: 2048
            }))
            .setTimestamp()
        let m = await message.channel.send(embed);
        client.commands.clear();
        client.aliases.clear();
        const list = fs.readdirSync('./commands/');
        for (let file of list) {
            try {
                delete require.cache[require.resolve(`./${file}`)]
                let pull = require(`./${file}`);
                if (pull.name && pull.run && pull.aliases) {
                    table.addRow(file, '✅');
                    for (let alias of pull.aliases) {
                        client.aliases.set(alias, pull.name);
                    }
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
        embed.setColor('RANDOM')
            .setTitle(`${client.emojis.cache.find(x => x.name == 'botLab_done')} ${client.user.username}의 모든 파일을 리로드 완료(${client.commands.size}개)`);
        m.edit(embed);
        console.log(`${table}\n-------------------------------`);
    }
}