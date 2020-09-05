import {EntityRepository, Repository, EntityManager} from "typeorm";
import {users as User} from "./entities/users";
import {access_token as AccessToken} from "./entities/access_token";

@EntityRepository()
export class UserRepository {

    constructor(private manager: EntityManager) {}

    async findByAccessToken(token: string): Promise<User | null> {
        const tokenModel = await this.manager.findOne(AccessToken, {
            relations: ["user"],
            where: {token},
        });

        // TODO: Need to upgrade typescript to get null coalescing
        // return tokenModel?.user;
        return tokenModel ? tokenModel.user : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.manager.findOne(User, { email });
    }
}
