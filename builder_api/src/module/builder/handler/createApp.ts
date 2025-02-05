import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp} from "../../../type";
import {Queue} from 'bullmq';
import {HTTPException} from "hono/http-exception";
import {AuthService} from "../../auth/service/auth.service";
import {ProjectService} from "../service/project.service";

// Define request body schema
const BuildBodySchema = z
    .object({
        repoUrl: z
            .string()
            .url()
            .openapi({description: "Git repository URL", example: "https://github.com/user/repo"}),
        name: z
            .string()
            .min(1)
            .openapi({description: "Project name", example: "My React App"}),
    })
    .openapi("CreateBuildJobBody");

export type CreateBuildJobBody = z.infer<typeof BuildBodySchema>;

// Define response schema
const BuildResponseSchema = z
    .object({
        jobId: z.string().openapi({description: "The ID of the job added to the queue"}),
        projectId: z.string().openapi({description: "The ID of the created project"}),
        message: z.string(),
    })
    .openapi("CreateBuildJobResponse");

export type CreateBuildJobResponse = z.infer<typeof BuildResponseSchema>;

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: "post",
            path: "/build",
            security: [{bearerAuth: []}],
            tags: ["Build"],
            description: "Request to create a new project and add a build job to the queue",
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
                    description: "Successfully created project and added build job to queue",
                },
                400: {
                    content: {
                        "application/json": {
                            schema: z.object({message: z.string()}),
                        },
                    },
                    description: "Bad request",
                },
                401: {
                    content: {
                        "application/json": {
                            schema: z.object({message: z.string()}),
                        },
                    },
                    description: "Unauthorized",
                },
                500: {
                    content: {
                        "application/json": {
                            schema: z.object({message: z.string()}),
                        },
                    },
                    description: "Failed to process request",
                },
            },
        }),
        async (c) => {
            const authService = new AuthService();
            const projectService = new ProjectService();
            const {authID} = c.get('jwtPayload');
            if (!authID) {
                throw new HTTPException(401, {message: 'Unauthorized: Missing or invalid authID'});
            }

            const projectId = crypto.randomUUID();
            const {repoUrl, name} = c.req.valid("json") as CreateBuildJobBody;
            const userId = await authService.findUserIdByAuthId(authID);
            if(!userId) {
                throw new HTTPException(401, {message: 'Unauthorized: Missing or invalid authID'});
            }
            try {
                // Store project in database
                await projectService.createProject({name, repoUrl, userId, projectId});

                // Add build job to queue
                const buildQueue = new Queue("buildQueue", {
                    connection: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379')
                    }
                });

                await buildQueue.add(projectId, {repoUrl, projectId, userId});

                return c.json(
                    {
                        message: "Project created and build job added",
                        projectId,
                        jobId: projectId,
                    },
                    200
                );
            } catch (err) {
                console.error("Error processing request:", err);
                return c.json({message: "Failed to process request"}, 500);
            }
        }
    );