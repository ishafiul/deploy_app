import {LibSQLDatabase} from "drizzle-orm/libsql";
import {getDbClient} from "../../../utils/db/client";
import {projects} from "../../../db/schema";

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
            id: projectId,
            name,
            repoUrl,
            userId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
}