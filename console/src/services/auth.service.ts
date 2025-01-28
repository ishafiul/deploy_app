import { api } from './api';
import { CreateDeviceUuidDto, RequestOtpDto, VerifyOtpDto } from '../types/auth.types';

export const authService = {
  createDeviceUuid: async (data: CreateDeviceUuidDto) => {
    const response = await api.post('/auth/createDeviceUuid', data);
    return response.data;
  },

  requestOtp: async (data: RequestOtpDto) => {
    const response = await api.post('/auth/reqOtp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpDto) => {
    const response = await api.post('/auth/verifyOtp', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.delete('/auth/logout');
    return response.data;
  },
}; 