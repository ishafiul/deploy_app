import {OpenAPIHono, z} from '@hono/zod-openapi'
import {swaggerUI} from '@hono/swagger-ui'
import {HonoTypes} from "./type";
import {onError} from "./utils/error";
import {Logger} from "./utils/logger";
import {Context} from "hono";
import builderRoute from "./module/builder/route";

const app = new OpenAPIHono<HonoTypes>();

app.get('/health', (c) => {
    return c.json({status: 'UP'});
});


app.openAPIRegistry.registerComponent("securitySchemes", "AUTH", {
    type: "http",
    name: "Authorization",
    scheme: "bearer",
    in: "header",
    description: "Bearer token",
});

app.get(
    '/ui',
    swaggerUI({
        url: '/doc',
    })
)

app.doc('/doc', {
    info: {
        title: 'Todo API',
        version: 'v1'
    },
    openapi: '3.1.0'
})


builderRoute(app)


app.onError(async (err, c) => {
    const logger = new Logger("ROOT");
    return onError(logger, err, c);
});

export default app