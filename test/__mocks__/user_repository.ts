import * as sinon from "sinon";

import {users as User} from "../../src/typeorm/entities/users";
import {UserRepository} from "../../src/typeorm/user_repository";


class UserRepositoryStub {
    private userData: {[username: string]: User};

    addUser(user: User): void {
        this.userData[user.email] = user;
    }


}


export default function() {

    const userByEmail: {[username: string]: User} = {};

    const stub = sinon.stub(UserRepository.prototype);

    stub.addUser = (user: User) => { userByEmail[user.email] = user };
    stub.findByEmail = async (username: string) => userByEmail[username];

    return stub;
}
