import {LibSQLDatabase} from "drizzle-orm/libsql";
import {getDbClient} from "../../../utils/db/client";
import {projects} from "../../../../drizzle/schema/projects.schema";
import {and, eq} from "drizzle-orm";

export class ProjectService {
    private readonly db: LibSQLDatabase;

    constructor() {
        this.db = getDbClient();
    }

    async findProjectById(projectId: string, userId: string) {
        const result = await this.db
            .select()
            .from(projects)
            .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
            .limit(1);

        return result[0] || null;
    }

    async findProjectsByUserId(userId: string) {
        return this.db
            .select()
            .from(projects)
            .where(eq(projects.userId, userId));
    }
} 