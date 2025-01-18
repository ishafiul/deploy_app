import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp, HonoContext} from "../../../type";
import {HTTPException} from "hono/http-exception";
import {authMiddleware} from "../../../middleware/auth";
import {AuthService} from "../service/auth.service";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: 'delete',
            path: '/auth/logout',
            security: [{AUTH: []}],
            tags: ['Auth'],
            middleware: [authMiddleware],
            responses: {
                200: {
                    description: 'Logout successful',
                    content: {
                        'application/json': {schema: z.object({message: z.string()})},
                    },
                },
            },
        }),
        async (c) => {
            const auth = new AuthService();

            const {authID} = c.get('jwtPayload');
            if (!authID) {
                throw new HTTPException(401, {message: 'Unauthorized: Missing or invalid authID'});
            }

            // Attempt to logout, handle failure case
            const result = await auth.logout(authID);

            if (!result) {
                throw new HTTPException(500, {message: 'Logout failed: Something went wrong'});
            }

            // Successful logout response
            return c.json({message: 'Logout successful'}, 200);
        }
    );