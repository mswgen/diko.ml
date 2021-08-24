import Discord from 'discord.js';
import mongodb from 'mongodb';
export default class Bot extends Discord.Client {
    public commands: Discord.Collection <string, ClientCommands>;
    public db: mongodb.Document | undefined;
    public devs: Array<string>;
    constructor (...args: Array<any>) {
        super (...args);
        this.commands = new Discord.Collection();
        this.db = undefined;
        this.devs = ['647736678815105037'];
    }
}
interface ClientCommands {
    name: string,
    run: (client: Bot, message: any) => Promise<void>
}