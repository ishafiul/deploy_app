import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp, HonoContext} from "../../../type";
import {HTTPException} from "hono/http-exception";
import {CreateDeviceUuidDto, CreateDeviceUuidSchema} from "../dto/createDeviceUuid.dto";
import {AuthService} from "../service/auth.service";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: "post",
            path: "/auth/createDeviceUuid",
            tags: ["Auth"],
            description: "Endpoint to create a device UUID",
            request: {
                body: {
                    content: {
                        "application/json": {
                            schema: CreateDeviceUuidSchema,
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Respond with device UUID',
                    content: {
                        'application/json': {schema: z.object({deviceUuid: z.string()}).openapi('CreateDeviceUuidResponse')},
                    },
                },
            },
        }),
        async (c) => {
            const auth = new AuthService();
            const bodyJson = await c.req.json<CreateDeviceUuidDto>();

            const body = CreateDeviceUuidSchema.parse(bodyJson);

            const deviceUuidEntity = await auth.createDeviceUuid(body);
            if (!deviceUuidEntity) {
                throw new HTTPException(409, {message: 'Failed to create Device UUID'});
            }

            return c.json(deviceUuidEntity, 201);
        }
    );