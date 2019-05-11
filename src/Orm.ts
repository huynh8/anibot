import {createConnection} from "typeorm";
import {User} from "./entity/User";

export class Orm {
    private static readonly ormConnection = createConnection();

    static sync(discordId: string, anilistId: number) {
        this.ormConnection
            .then(connection => {
                return connection.manager
                    .save(new User(discordId, anilistId))
                    .catch(error => console.log(error));
            })
            .catch(error => console.log(error));
    }

    static async searchAnilistId(discordId: string) {
        let anilistId = await this.ormConnection.then(async connection => {
            let userRepo = connection.getRepository(User);
            // @ts-ignore
            let user = await userRepo.findOneOrFail({id: discordId});
            return user.anilistId;
        }).catch(error => {
            console.log(error)
        });

        if (anilistId == null) {
            throw new Error("User not found");
        }

        return anilistId;
    }

}


