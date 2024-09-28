import {Logger} from "./logger";
import {Context} from "hono";
import {HTTPException} from "hono/http-exception";
import {HonoTypes} from "../type";

export function onError(logger: Logger, err: Error, c: any) {
    const ctx = c as Context<HonoTypes>;
    if (isHTTPException(err)) {
        const {status, message} = err;


        logger.error('http exception', {message, status});
        return ctx.json({message: message || 'Something went wrong'}, status);
    }

    logger.error('error', {message: err.message, stack: err.stack, status: 500});
    return ctx.json({message: 'Internal Server Error'}, 500);
}

function isHTTPException(err: Error): err is HTTPException {
    return err.constructor.name.toLowerCase().includes('httpexception');
}