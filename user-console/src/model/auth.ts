import {z} from "zod";

export const TokenResponseSchema = z.object({
    accessToken: z.string()
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const CreateDeviceUuidResponse = z.object({
    deviceUuid: z.string()
});

export type CreateDeviceUuidResponse = z.infer<typeof CreateDeviceUuidResponse>;