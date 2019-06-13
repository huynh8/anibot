import {Anilist} from "./Anilist";
import * as Discord from "discord.js";
import {Message} from "discord.js";
import {Orm} from "./Orm";

export class Commands {
    static readonly userRegex = /<@([a-zA-z0-9]+)>/;

    static async runCommand(receivedMessage: Message, prefix: string) {
        let commandAndParams: string[] = receivedMessage.content.replace(prefix, "").split(/\s+/g);
        let command: string = commandAndParams[0];
        let params: string[] = commandAndParams.slice(1);

        switch (command) {
            case "top":
                if (this.userRegex.test(params[0])) {
                    let match = this.userRegex.exec(params[0]);
                    // @ts-ignore
                    let anilistId: number = await Orm.searchAnilistId(match[1]); //userRegex test will do null check
                    let list = await Anilist.getAnimeByUser(anilistId);
                    receivedMessage.channel.send(new Discord.RichEmbed().setDescription(list));
                }
                break;
            case "login":
                try {
                    let anilistId: number = await Anilist.getUserId(params[0]);
                    await Orm.sync(receivedMessage.author.id, anilistId);
                    receivedMessage.channel.send("<@" + receivedMessage.author.id + "> has linked to Anilist profile " + params[0]);
                } catch (e) {
                    receivedMessage.channel.send("Unable to sync account to " + params[0]);
                }
                break;
            default:
                break;
        }
    }
}