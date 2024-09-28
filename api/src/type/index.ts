import { OpenAPIHono } from '@hono/zod-openapi';
import { Context } from 'hono';

export type Env = {
    DB_URL: string;
    DB_AUTH_TOKEN: string;
    SERVER_AUTH_TOKEN: string;
    TOKEN_PRIVATE_KEY: string;
    TOKEN_PUBLIC_KEY: string;
};

export type HonoTypes = {
    Bindings: Env;
    Variables: {
        auth?: { aid: number; uid: number };
    };
};

export type HonoApp = OpenAPIHono<HonoTypes>;
export type HonoContext = Context<HonoTypes>;