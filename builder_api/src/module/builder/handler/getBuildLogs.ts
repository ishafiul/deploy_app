import {createRoute, z} from "@hono/zod-openapi";
import {BuildLogsService} from "../service/buildLogs.service";
import {authMiddleware} from "../../../middleware/auth";
import {HTTPException} from "hono/http-exception";
import {HonoApp} from "../../../type";


export default (app: HonoApp)=> {
    app.openapi(createRoute({
        method: 'get',
        path: "/build/logs/{projectId}",
        security: [{AUTH: []}],
        middleware: [authMiddleware],
        tags: ["Build"],
        request: {
            params: z.object({
                projectId: z.string().describe('projectId'),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                id: z.string(),
                                buildId: z.string(),
                                logs: z.string(),
                                createdAt: z.date(),
                                updatedAt: z.date(),
                            }).nullable(),
                        }),
                    },
                },
                description: 'Successfully retrieved build logs',
            },

        },
    }),async (c) => {
        const buildId = c.req.param('projectId');
        const buildLogsService = new BuildLogsService();
        const logs = await buildLogsService.getBuildLogsById(buildId);

        if (!logs) {
            throw new HTTPException(404, {message: 'Build logs not found'});
        }

        return c.json({success: true, data: logs}, 200);
    });
} 