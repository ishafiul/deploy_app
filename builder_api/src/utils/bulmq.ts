import {getDbClient} from "./db/client";
import {buildLogs} from "../../drizzle/schema/projects.schema";
import {server} from "../index";
import {v4 as uuidv4} from "uuid";
import {Worker} from 'bullmq';

export default ()=> {
    const worker = new Worker("buildLogs", async (job) => {
        const { projectId, userId, message, level } = job.data;
        const db = getDbClient();
        console.log(job.data)
        // Store log in database
        try {
            db.insert(buildLogs).values({
                id: uuidv4(),
                projectId,
                userId,
                message,
                level,
                timestamp: new Date(),
            }).then(()=>{
                console.log("Log stored in database")
            });

        } catch (error) {
            console.error('Error storing log in database:', error);
        }

        server.publish(userId, JSON.stringify({
            buildLogs:{
                projectId,
                message,
            }
        }))
    }, {
        connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
    });
    console.log("Connected to Redis");

}
