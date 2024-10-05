const LOCAL_STORAGE_KEYS = {
    TOKEN: "token",
    FCM_TOKEN: "fcm_token",
    DEVICE_UUID: "device_uuid",
};

class LocalStorageService {
    private static setItem(key: string, value: string) {
        localStorage.setItem(key, value);
    }
    private static getItem(key: string): string | null {
        return localStorage.getItem(key);
    }
    private static removeItem(key: string) {
        localStorage.removeItem(key);
    }

    static setToken(token: string) {
        this.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    }
    static getToken(): string | null {
        return this.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    }
    static removeToken() {
        this.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    }


    static setFcmToken(token: string) {
        this.setItem(LOCAL_STORAGE_KEYS.FCM_TOKEN, token);
    }
    static getFcmToken(): string | null {
        return this.getItem(LOCAL_STORAGE_KEYS.FCM_TOKEN);
    }
    static removeFcmToken() {
        this.removeItem(LOCAL_STORAGE_KEYS.FCM_TOKEN);
    }

    static setDeviceUuid(id: string) {
        this.setItem(LOCAL_STORAGE_KEYS.DEVICE_UUID, id);
    }
    static getDeviceUuid(): string | null {
        return this.getItem(LOCAL_STORAGE_KEYS.DEVICE_UUID);
    }
    static removeDeviceUuid() {
        this.removeItem(LOCAL_STORAGE_KEYS.DEVICE_UUID);
    }
}

export default LocalStorageService;
