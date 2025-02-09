export interface CreateDeviceUuidDto {
  deviceType?: string;
  osName?: string;
  osVersion?: string;
  deviceModel?: string;
  isPhysicalDevice?: boolean;
  appVersion?: string;
  ipAddress?: string;
  fcmToken: string;
}

export interface RequestOtpDto {
  email: string;
  deviceUuid: string;
}

export interface VerifyOtpDto {
  email: string;
  deviceUuid: string;
  otp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  deviceUuid: string | null;
  email: string | null;
  accessToken: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthResponse {
  accessToken: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  userId: string;
} 