import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { websocketService } from '../../services/websocket.service';
import { AuthState, CreateDeviceUuidDto, RequestOtpDto, VerifyOtpDto } from '../../types/auth.types';

// Get stored values
const accessToken = localStorage.getItem('accessToken');
const deviceUuid = localStorage.getItem('deviceUuid');
const email = localStorage.getItem('email');
const userId = localStorage.getItem('userId');

// Validate stored token
const validateStoredToken = () => {
  if (!accessToken || !userId) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    return false;
  }
  return true;
};

const initialState: AuthState = {
  isAuthenticated: validateStoredToken(),
  deviceUuid,
  email,
  accessToken: validateStoredToken() ? accessToken : null,
  userId: validateStoredToken() ? userId : null,
  loading: false,
  error: null,
};

// If user is already authenticated, connect to WebSocket
if (initialState.isAuthenticated && initialState.userId) {
  websocketService.connect();
}

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
    websocketService.disconnect();
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
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.userId = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
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
        state.userId = action.payload.userId;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('userId', action.payload.userId);
        // Connect to WebSocket after successful login
        websocketService.connect();
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
        state.userId = null;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer; 