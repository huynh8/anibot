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
                    let animeList = await Anilist.getAnimeByUser(anilistId, 10);
                    let formattedList: string = "<@" + receivedMessage.author.id + ">'s Top 10\n";
                    for (let i = 1; i <= animeList.length; i++) {
                        formattedList = formattedList.concat(i + ". [" + animeList[i - 1].media.title.userPreferred + "](" + animeList[i - 1].media.siteUrl + ") - " + animeList[i - 1].score + "/10\n");
                    }
                    receivedMessage.channel.send(new Discord.RichEmbed()
                        .setDescription(formattedList));
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
            case "profile":
                if (this.userRegex.test(params[0])) {
                    let match = this.userRegex.exec(params[0]);
                    // @ts-ignore
                    let anilistId: number = await Orm.searchAnilistId(match[1]); //userRegex test will do null check
                    let profile = await Anilist.getProfile(anilistId);
                    let userInfo = profile.data.User;
                    let embed = new Discord.RichEmbed()
                        .setTitle(userInfo.name)
                        .setThumbnail(userInfo.avatar.medium)
                        // @ts-ignore
                        .addField("Discord", "<@" + match[1] + ">", true);
                    if (userInfo.about != null) {
                        embed.setDescription(userInfo.about);
                    }
                    if (userInfo.favourites.anime.nodes.length == 1) {
                        embed.addField("Favorite Anime", userInfo.favourites.anime.nodes[0].title.userPreferred);
                        embed.setImage(userInfo.favourites.anime.nodes[0].coverImage.medium);
                    }
                    receivedMessage.channel.send(embed);
                }
                break;
            default:
                break;
        }
    }
}