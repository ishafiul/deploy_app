import axiosInstance from "@/utils/http_client";
import {Axios} from "axios";

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
}

