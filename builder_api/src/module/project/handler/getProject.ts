import {createRoute} from '@hono/zod-openapi';
import {HonoApp, HonoContext} from '../../../type';
import {ProjectService} from '../service/project.service';
import {ProjectResponseSchema} from '../dto/project.dto';
import {HTTPException} from 'hono/http-exception';
import {AuthService} from "../../auth/service/auth.service";
import {authMiddleware} from "../../../middleware/auth";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: 'get',
            path: '/projects/{projectId}',
            security: [{AUTH: []}],
            tags: ['Projects'],
            middleware: [authMiddleware],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The ID of the project to retrieve',
                },
            ],
            responses: {
                200: {
                    description: 'Project details',
                    content: {
                        'application/json': {
                            schema: ProjectResponseSchema,
                        },
                    },
                },
            },
        }),
        async (c) => {
            const {authID} = c.get('jwtPayload');
            if (!authID) {
                throw new HTTPException(401, {message: 'Unauthorized: Missing or invalid authID'});
            }
            const authService = new AuthService();
            const userId = await authService.findUserIdByAuthId(authID);
            const projectId = c.req.param('projectId');
            const projectService = new ProjectService();
            if(!userId) {
                throw new HTTPException(400, {message: 'User not found'});
            }
            const project = await projectService.findProjectById(projectId, userId);

            if (!project) {
                throw new HTTPException(404, {message: 'Project not found'});
            }
            const response = {
                id: project.id,
                name: project.name,
                repoUrl: project.repoUrl,
                userId: project.userId,
                url: `http://${project.id}.${process.env.PROXY_HOST}`,
                status: project.status
            }
            return c.json(response, 200);
        }
    );