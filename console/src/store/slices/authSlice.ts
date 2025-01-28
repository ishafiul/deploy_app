import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { AuthState, CreateDeviceUuidDto, RequestOtpDto, VerifyOtpDto } from '../../types/auth.types';

const accessToken = localStorage.getItem('accessToken');

const initialState: AuthState = {
  isAuthenticated: !!accessToken,
  deviceUuid: localStorage.getItem('deviceUuid'),
  email: localStorage.getItem('email'),
  accessToken: accessToken,
  loading: false,
  error: null,
};

export const createDeviceUuid = createAsyncThunk(
  'auth/createDeviceUuid',
  async (data: CreateDeviceUuidDto) => {
    const response = await authService.createDeviceUuid(data);
    return response;
  }
);

export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (data: RequestOtpDto) => {
    const response = await authService.requestOtp(data);
    return response;
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: VerifyOtpDto) => {
    const response = await authService.verifyOtp(data);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    localStorage.clear();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Device UUID
      .addCase(createDeviceUuid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeviceUuid.fulfilled, (state, action) => {
        state.loading = false;
        state.deviceUuid = action.payload.deviceUuid;
        localStorage.setItem('deviceUuid', action.payload.deviceUuid);
      })
      .addCase(createDeviceUuid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create device UUID';
      })
      // Request OTP
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.meta.arg.email;
        localStorage.setItem('email', action.meta.arg.email);
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to request OTP';
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to verify OTP';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.deviceUuid = null;
        state.email = null;
        state.accessToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 