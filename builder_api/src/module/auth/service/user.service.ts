import {LibSQLDatabase} from "drizzle-orm/libsql";
import {getDbClient} from "../../../utils/db/client";
import {v4 as uuidv4} from 'uuid';
import {users} from "../../../../drizzle/schema/user.schema";
import {eq} from "drizzle-orm";

export class UserService {
    private readonly db: LibSQLDatabase;

    constructor() {
        this.db = getDbClient();
    }
    async findUserOrCreate(email: string): Promise<{ id: string, email: string }> {
        if (this.db === undefined) {
            throw new Error('db is not defined');
        }
        const alreadyExistsUsers = await this.db.select().from(users).where(eq(users.email, email));

        if (alreadyExistsUsers.length === 0) {
            const newCreatedUsers = await this.db.insert(users).values({
                id: uuidv4(),
                email: email
            }).returning({
                id: users.id,
                email: users.email
            });
            return newCreatedUsers[0];
        } else {
            return alreadyExistsUsers[0];
        }
    }

    async findUserByEmail(email: string) {
        if (this.db === undefined) {
            throw new Error('db is not defined');
        }
        const alreadyExistsUsers = await this.db.select().from(users).where(eq(users.email, email));
        return alreadyExistsUsers[0];
    }
}