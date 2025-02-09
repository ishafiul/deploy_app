import {HonoApp, HonoTypes} from "../../type";
import createApp from "./handler/createApp";
import buildLogs from "./handler/buildLogs";
import getBuildLogs from "./handler/getBuildLogs";
import {OpenAPIHono} from "@hono/zod-openapi";
import type {ServerWebSocket} from "bun";

export default function builderRoute(app: HonoApp) {
    createApp(app)
    buildLogs(app)
    getBuildLogs(app)
}
