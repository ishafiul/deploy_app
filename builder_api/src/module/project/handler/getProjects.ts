import {createRoute} from '@hono/zod-openapi';
import {HonoApp, HonoContext} from '../../../type';
import {ProjectService} from '../service/project.service';
import {ProjectsResponseSchema} from '../dto/project.dto';
import {HTTPException} from 'hono/http-exception';
import {AuthService} from "../../auth/service/auth.service";
import * as http from "node:http";
import {authMiddleware} from "../../../middleware/auth";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: 'get',
            path: '/projects',
            security: [{AUTH: []}],
            tags: ['Projects'],
            middleware: [authMiddleware],
            responses: {
                200: {
                    description: 'List of user projects',
                    content: {
                        'application/json': {
                            schema: ProjectsResponseSchema,
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

            const projectService = new ProjectService();
            if (!userId) {
                throw new HTTPException(400, {message: 'User not found'});
            }
            const projects = await projectService.findProjectsByUserId(userId);
            const projectsResponse = projects.map((project) => ({
                id: project.id,
                name: project.name,
                repoUrl: project.repoUrl,
                userId: project.userId,
                url: `http://${project.id}.${process.env.PROXY_HOST}`,
                status: project.status
            }))
            return c.json({projects: projectsResponse}, 200);
        }
    ); 