import config from "../src/config";
import createConnection, {Connection} from "../src/typeorm_db";

// Need to merge the `connection` propetty we're adding to the Mocha Suite prototype
declare module 'mocha' {
    interface Suite {
        connection: Connection;
    }
}

export const mochaHooks = {

    async beforeAll() {
        const conf = config();
        this.connection = await createConnection( conf );
    },

    async afterAll() {
        await this.connection.close();
    },

}
