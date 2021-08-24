import Bot from '../Bot';
import axios from 'axios';
export default {
    name: 'hellothisisverification',
    run: async (client: Bot, interaction: any) => {
        await axios.patch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                content: client.devs.map((x: string) => `${client.users.cache.get(x)!.tag}(${x})`).join(', ')
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    }
}