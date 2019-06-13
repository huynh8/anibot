import 'isomorphic-fetch'
import {Message} from "discord.js";

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

    static async getAnimeByUser(userId: number): Promise<string> {
        let variables = {
            page: 1,
            perPage: 10,
            userId: userId,
            sort: "SCORE_DESC"
        };

        let res = await this.callAnilistApi(this.query, variables);

        let json = await res.json();

        let mediaList = json.data.Page.mediaList;

        let list: string = "";
        for (let i = 1; i <= mediaList.length; i++) {
            list = list.concat(i + ". " + mediaList[i - 1].media.title.userPreferred + " - " + mediaList[i - 1].score + "/10\n");
        }
        return list;
    }

    static async getUserId(userName: string): Promise<number> {
        let variables = {
            userName: userName
        };

        let res = await this.callAnilistApi(this.userQuery, variables);

        if (res.status === 404) {
            throw new Error("User not found " + userName);
        }

        let json = await res.json();
        return json.data.User.id;
    }

    private static async callAnilistApi(query: string, variables: any) {
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

        return await fetch(this.anilistUrl, options);
    }
}
