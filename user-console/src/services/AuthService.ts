import axiosInstance from "@/utils/http_client";
import {Axios} from "axios";
import {CreateDeviceUuidResponse, TokenResponseSchema} from "@/model/auth";
import LocalStorageService from "@/services/local_store_service";
import {uuidv4} from "@firebase/util";

export default class AuthService {
    private readonly axiosInstance: Axios;

    constructor() {
        this.axiosInstance = axiosInstance; // Replace with your actual API URL
    }

    async sendOTP(email: string): Promise<void> {
        const response = await axiosInstance.post(`/send-otp`, {email});
        return response.data;
    }

    async verifyOTP(email: string, otp: string): Promise<void> {
        const response = await axiosInstance.post(`/verify-otp`, {email, otp});
        return response.data;
    }

    async refreshToken(): Promise<void> {

    }

    async logout(): Promise<void> {

    }

    loginWithGithub() {
        const redirectUri = `https://console.groundcraft.xyz/auth/verify-github`;

        window.location.href = `https://github.com/login/oauth/authorize?client_id=cf3ae7cb2b965ebd749e&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    }

    async verifyGithubAuthCode(code: string) {
        const deviceUuid = await this.createDeviceUuid();
        if (deviceUuid === null || deviceUuid === undefined) {
            console.log('device uuid is null');
            return null;
        }
        LocalStorageService.setDeviceUuid(deviceUuid.deviceUuid);
        const response = await axiosInstance.post(`/auth/github`, {code, deviceUuid: deviceUuid.deviceUuid});
        const parsedBody = TokenResponseSchema.parse(response.data);
        LocalStorageService.setToken(parsedBody.accessToken);
        return parsedBody;
    }

    private async createDeviceUuid() {
        const payload = {
            "deviceType": "web",
            "osName": "web",
            "osVersion": "web",
            "deviceModel": "web",
            "isPhysicalDevice": true,
            "appVersion": "web v0.01",
            "ipAddress": "0.0.0.0",
            "fcmToken": uuidv4()
        }
        const response = await axiosInstance.post('/auth/createDeviceUuid', payload);
        return CreateDeviceUuidResponse.parse(response.data)
    }

}

