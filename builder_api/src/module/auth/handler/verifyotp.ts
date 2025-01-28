import {createRoute, z} from "@hono/zod-openapi";
import {HonoApp, HonoContext} from "../../../type";
import {HTTPException} from "hono/http-exception";
import {sign} from "hono/jwt";
import {AuthService} from "../service/auth.service";
import {UserService} from "../service/user.service";
import {VerifyOtpDto, VerifyOtpSchema} from "../dto/verifyOtp.dto";

export default (app: HonoApp) =>
    app.openapi(
        createRoute({
            method: 'post',
            path: '/auth/verifyOtp',
            tags: ['Auth'],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: VerifyOtpSchema,
                            example: {
                                email: 'shafiulislam20@gmail.com',
                                deviceUuid: 'e3716131-6aaa-4c5d-b468-71eb9a410b5c',
                                otp: 12345,
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Access Token',
                    content: {
                        'application/json': {schema: z.object({accessToken: z.string()})},
                    },
                },
            },
        }),
        async (c: HonoContext) => {
            const authService = new AuthService();
            const userService = new UserService();

            // Parse and validate the request body
            const bodyJson = await c.req.json<VerifyOtpDto>();
            const body = VerifyOtpSchema.parse(bodyJson);

            // Find user, handle user not found
            const user = await userService.findUserOrCreate(body.email);
            if (!user) {
                throw new HTTPException(404, {message: 'User not found'});
            }

            // Verify OTP, handle invalid OTP scenario
            const auth = await authService.verifyOtp(body, user);
            if (!auth) {
                throw new HTTPException(401, {message: 'Invalid OTP'});
            }

            // Create JWT payload
            const jwtPayload = {
                authID: auth.id,
                // exp: Math.floor(Date.now() / 1000) + 60 * 5, // Set expiration if needed
            };

            // Sign and return the JWT
            const accessToken = await sign(jwtPayload, process.env.JWT_SECRET!);

            return c.json({accessToken}, 200);
        }
    );