import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";

export function getDbClient() {
    const url = process.env.TURSO_URL;
    if (url === undefined) {
        throw new Error('TURSO_URL is not defined');
    }

    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (authToken === undefined) {
        throw new Error('TURSO_AUTH_TOKEN is not defined');
    }

    return drizzle(createClient({url, authToken}));
}