import {eq} from "drizzle-orm";
import {LibSQLDatabase} from "drizzle-orm/libsql";
import {getDbClient} from "../../../utils/db/client";
import {buildLogs} from "../../../../drizzle/schema/projects.schema";

export class BuildLogsService {
    private readonly db: LibSQLDatabase;

    constructor() {
        this.db = getDbClient();
    }
     async getBuildLogsById(projectId: string) {
        try {
            return await this.db.select().from(buildLogs).where(eq(buildLogs.projectId, projectId));
        } catch (error) {
            console.error('Error fetching build logs:', error);
            throw error;
        }
    }
} 