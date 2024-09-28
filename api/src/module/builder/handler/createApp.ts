import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp, HonoContext} from "../../../type";
import {Queue} from 'bullmq';

// Define request body schema
const BuildBodySchema = z
    .object({
        repoUrl: z
            .string()
            .url()
            .openapi({description: "Git repository URL", example: "https://github.com/user/repo"}),
    })
    .openapi("CreateBuildJobBody");

export type CreateBuildJobBody = z.infer<typeof BuildBodySchema>;

// Define response schema
const BuildResponseSchema = z
    .object({
        jobId: z.string().openapi({description: "The ID of the job added to the queue"}),
        message: z.string(),
    })
    .openapi("CreateBuildJobResponse");

export type CreateBuildJobResponse = z.infer<typeof BuildResponseSchema>;

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: "post",
            path: "/build",
            tags: ["Build"],
            description: "Request to add a build job to the queue",
            request: {
                body: {
                    content: {
                        "application/json": {
                            schema: BuildBodySchema,
                        },
                    },
                },
            },
            responses: {
                200: {
                    content: {
                        "application/json": {
                            schema: BuildResponseSchema,
                        },
                    },
                    description: "Successfully added build job to queue",
                },
                400: {
                    content: {
                        "application/json": {
                            schema: z.object({message: z.string()}),
                        },
                    },
                    description: "Bad request (missing repoUrl or projectId)",
                },
                500: {
                    content: {
                        "application/json": {
                            schema: z.object({message: z.string()}),
                        },
                    },
                    description: "Failed to add job to queue",
                },
            },
        }),
        async (c) => {
            const projectId = crypto.randomUUID();
            const {repoUrl} = c.req.valid("json") as CreateBuildJobBody;
            const buildQueue = new Queue("buildQueue", {
                connection: {
                    host: '192.168.0.101',
                    port: 6379
                }
            });
            await buildQueue.obliterate({ force: true });

            try {
                await buildQueue.add(projectId, {repoUrl, projectId});
                return c.json(
                    {
                        message: "Build job added",
                        jobId: projectId,
                    },
                    200
                );
            } catch (err) {
                console.error("Error adding job to queue:", err);
                return c.json({message: "Failed to add job to queue"}, 500);
            }
        }
    );