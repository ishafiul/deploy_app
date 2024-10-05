// utils/axiosInstance.js

import axios from 'axios';
import Router from 'next/router';
import LocalStorageService from "@/services/local_store_service"; // For redirecting to login when necessary

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: "https://api.ishaf.info", // Your API base URL
});

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = LocalStorageService.getToken();
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        // If the response is successful, return it as-is
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is a 401 Unauthorized and the request has not been retried yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const refreshResponse = await axios.post(`https://api.ishaf.info/auth/refresh`, {}, {
                    withCredentials: true, // For sending cookies
                });

                // Get the new access token
                const {accessToken} = refreshResponse.data;
                LocalStorageService.setToken(accessToken);
                // Update the Authorization header in the original request
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Retry the original request with the new access token
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out the user
                localStorage.removeItem('accessToken');
                await Router.push('/login'); // Redirect to login page
                return Promise.reject(refreshError);
            }
        }

        // If it's a different error, reject it
        return Promise.reject(error);
    }
);

export default axiosInstance;
