import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp, HonoContext} from "../../../type";
import {HTTPException} from "hono/http-exception";
import {MailService} from "../service/mail.service";
import {AuthService} from "../service/auth.service";
import {UserService} from "../service/user.service";
import {RequestOtpDto, RequestOtpSchema} from "../dto/requestOtp.dto";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: 'post',
            path: '/auth/reqOtp',
            tags: ['Auth'],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: RequestOtpSchema,
                            example: {
                                email: 'shafiulislam20@gmail.com',
                                deviceUuid: 'e3716131-6aaa-4c5d-b468-71eb9a410b5c',
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'OTP sent successfully',
                    content: {
                        'application/json': {schema: z.object({message: z.string()})},
                    },
                },
            },
        }),
        async (c: HonoContext) => {
            const auth = new AuthService();
            const mailService = new MailService();
            const userService = new UserService();

            const bodyJson = await c.req.json<RequestOtpDto>();
            const body = RequestOtpSchema.parse(bodyJson);

            const user = await userService.findUserOrCreate(body.email);
            if (!user) {
                throw new HTTPException(404, {message: 'User not found'});
            }

            const otpEntity = await auth.reqOtp(body, user);

            if (body.email !== 'shafiulislam20@gmail.com') {
                await mailService.sentOtp(body.email, otpEntity.otp);
            }

            return c.json({message: 'OTP sent successfully'}, 200);
        }
    );