import {OpenAPIHono, z} from '@hono/zod-openapi'
import {swaggerUI} from '@hono/swagger-ui'
import {cors} from 'hono/cors'
import {HonoTypes, websocket} from "./type";
import {onError} from "./utils/error";
import {Logger} from "./utils/logger";
import builderRoute from "./module/builder/route";
import authRoute from "./module/auth/route";
import { WebSocketHandler } from "bun";
import {BunWebSocketData} from "hono/dist/types/adapter/bun/websocket";
import bulmq from "./utils/bulmq";

const app = new OpenAPIHono<HonoTypes>();

export const server = Bun.serve({
    fetch: app.fetch,
    websocket: websocket as WebSocketHandler<BunWebSocketData>,
});

// Add CORS middleware
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400,
    credentials: true,
}));

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
        title: 'React Builder API',
        version: 'v1'
    },
    openapi: '3.1.0'
})
bulmq()
authRoute(app)
builderRoute(app)
app.onError(async (err, c) => {
    const logger = new Logger("ROOT");
    return onError(logger, err, c);
});

export default app