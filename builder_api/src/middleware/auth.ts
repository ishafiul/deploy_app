import {HonoContext} from "../type";
import {jwt} from "hono/jwt";
import {Next} from "hono";


export const authMiddleware = async (c: HonoContext, next: Next) => {
    const jwtMiddleware = jwt({secret: process.env.JWT_SECRET!});
    return jwtMiddleware(c, next);
};