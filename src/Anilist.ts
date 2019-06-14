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
                    siteUrl
                  }
                }
              }
            }`;

    private static readonly userQuery = `query ($userName: String) {
            User (name: $userName) {
                id
            }
    }`;

    private static readonly profileQuery = `query ($userId: Int, $page: Int, $perPage: Int) {
            User (id: $userId) {
                name
                about
                avatar {
                   medium 
                }
                favourites {
                    anime (page: $page, perPage: $perPage) {
                        nodes {
                            title {
                              userPreferred
                            }
                            coverImage {
                              medium
                            }
                        }
                    }
                }
            }
    }`;

    static async getAnimeByUser(userId: number, number: number): Promise<Array<any>> {
        let variables = {
            page: 1,
            perPage: number,
            userId: userId,
            sort: "SCORE_DESC"
        };

        let res = await this.callAnilistApi(this.query, variables);

        let json = await res.json();

        return json.data.Page.mediaList;
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

    static async getProfile(anilistId: number) {
        let variables = {
            userId: anilistId,
            page: 1,
            perPage: 1
        };

        let res = await this.callAnilistApi(this.profileQuery, variables);
        return await res.json();
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
