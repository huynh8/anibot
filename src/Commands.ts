import {Anilist} from "./Anilist";
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
                    let anilistId: number = await Orm.searchAnilistId(match[1]);
                    Anilist.getAnimeByUser(anilistId, receivedMessage);
                }
                break;
            case "login":
                Anilist.getUserId(params[0])
                    .then(userId => {
                        Orm.sync(receivedMessage.author.id, userId);
                    })
                    .then(_ => {
                        receivedMessage.channel.send("<@" + receivedMessage.author.id + "> has linked to Anilist profile " + params[0]);
                    })
                    .catch(error => console.log(error));
                break;
            default:
                break;
        }
    }
}