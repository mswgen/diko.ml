module.exports = {
    name: 'koreanbots',
    aliases: ['hellothisisverification'],
    description: 'koreanbots 봇 소유자 확인을 위한 명령어에요.',
    category: 'other',
    usage: 'd!hellothisisverification',
    run: async (client, message, args, option) => {
        message.channel.send(`${client.users.cache.get('647736678815105037').tag}(${client.users.cache.get('647736678815105037').id})`);
    }
}