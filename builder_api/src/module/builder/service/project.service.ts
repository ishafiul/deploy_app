import {LibSQLDatabase} from "drizzle-orm/libsql";
import {getDbClient} from "../../../utils/db/client";
import {projects} from "../../../../drizzle/schema/projects.schema";
import {v4 as uuidv4} from 'uuid';
export class ProjectService {
    private readonly db: LibSQLDatabase;

    constructor() {
        this.db = getDbClient();
    }

    async createProject({name, repoUrl, userId, projectId}: {
        name: string,
        repoUrl: string,
        userId: string,
        projectId: string
    }) {
        await this.db.insert(projects).values({
            id: uuidv4(),
            name: name,
            repoUrl: repoUrl,
            userId: userId,
            status: 'pending'
        });
    }
}