import { OpenAPIHono } from '@hono/zod-openapi';
import { Context } from 'hono';

export type Env = {
    TURSO_AUTH_TOKEN: string;
    TURSO_URL: string;
    JWT_SECRET: string;
    SERVER_KEY: string;
};

export type HonoTypes = {
    Bindings: Env;
    Variables: {
        auth?: { aid: number; uid: number };
    };
};

export type HonoApp = OpenAPIHono<HonoTypes>;
export type HonoContext = Context<HonoTypes>;