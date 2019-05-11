import 'isomorphic-fetch'
import {Message} from "discord.js";
import * as Discord from 'discord.js';

export class Anilist {
    private static readonly anilistUrl = "https://graphql.anilist.co";
    private static readonly query = `query ($page: Int, $perPage: Int, $userId: Int, $sort: [MediaListSort]) {
              Page (page: $page, perPage: $perPage) {
                pageInfo {
                  total
                }
                mediaList (userId: $userId, type: ANIME, status: COMPLETED, sort: $sort) {
                  score
                  media {
                    title {
                      userPreferred
                    }
                    coverImage {
                      medium
                    }
                  }
                }
              }
            }`;

    private static readonly userQuery = `query ($userName: String) {
            User (name: $userName) {
                id
            }
    }`;

    static getAnimeByUser(userId: number, message: Message) {
        let variables = {
            page: 1,
            perPage: 10,
            userId: userId,
            sort: "SCORE_DESC"
        };

        this.callAnilistApi(this.query, variables)
            .then(res => res.json())
            .then(json => {
                let count: number = 1;
                let list: string = "";
                json.data.Page.mediaList.forEach((show: any) => {
                    list = list.concat(count++ + ". " + show.media.title.userPreferred + " - " + show.score + "/10\n");
                });
                message.channel.send(new Discord.RichEmbed().setDescription(list));
            })
            .catch(error => {
                console.log(error)
            });
    }

    static getUserId(userName: string): Promise<number> {
        let variables = {
            userName: userName
        };
        return this.callAnilistApi(this.userQuery, variables)
            .then(res => {
                if (res.status === 404) {
                    throw new Error("User not found " + userName);
                }
                return res.json();
            })
            .then(json => json.data.User.id);
    }

    private static callAnilistApi(query: string, variables: any): Promise<any> {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

        return fetch(this.anilistUrl, options);
    }
}
