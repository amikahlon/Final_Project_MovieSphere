import axios from 'axios';
import { SignInResponse, SignUpResponse, LogoutResponse } from '../interfaces/auth.interfaces';
import { updateTokens } from '../store/slices/userSlice';
import { Dispatch } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api/users';

const signup = async (userData: {
  email: string;
  password: string;
  username: string;
}): Promise<SignUpResponse> => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Signup failed');
    }
    throw new Error('Signup failed');
  }
};

const signin = async (userData: { email: string; password: string }): Promise<SignInResponse> => {
  try {
    const response = await axios.post(`${API_URL}/signin`, userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Sign in failed';
      throw new Error(message);
    }
    throw error;
  }
};

const logout = async (refreshToken: string): Promise<LogoutResponse> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/logout`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Logout failed');
    }
    throw new Error('Logout failed');
  }
};

const googleSignin = async (credential: string): Promise<SignInResponse> => {
  try {
    const response = await axios.post(`${API_URL}/google-signin`, { credential });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Google sign in failed';
      throw new Error(message);
    }
    throw error;
  }
};

const refreshAccessToken = async (
  dispatch?: Dispatch,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    console.log('Current refresh token:', refreshToken);
    console.log('Current access token:', accessToken);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // Include the access token in the Authorization header
    const response = await axios.post(
      `${API_URL}/refresh-access-token`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // Update Redux state if dispatch is provided
      if (dispatch) {
        dispatch(
          updateTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        console.log('Redux state updated with new tokens');
      }

      // Notify components about the token update
      const event = new Event('tokenUpdated');
      window.dispatchEvent(event);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Token refresh failed');
    }
    throw new Error('Token refresh failed');
  }
};

const accessTokenStatus = async (): Promise<{ valid: boolean; message?: string }> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return { valid: false, message: 'No access token available' };
    }

    const response = await axios.post(
      `${API_URL}/access-token-status`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        valid: false,
        message: error.response.data.message || 'Token validation failed',
      };
    }
    return { valid: false, message: 'Token validation failed' };
  }
};

const checkAndLogTokenStatus = async (dispatch?: Dispatch): Promise<void> => {
  try {
    const status = await accessTokenStatus();
    console.log(
      `Access token status: ${status.valid ? 'Valid' : 'Invalid'}${status.message ? ` - ${status.message}` : ''}`,
    );

    // If token is invalid, automatically try to refresh it
    if (!status.valid) {
      console.log('Token is invalid. Attempting to refresh access token...');
      try {
        await refreshAccessToken(dispatch);
        console.log('Access token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh access token:', refreshError);
        // The refresh token might be expired too, but we don't interrupt the user experience
        // You might handle this differently based on your requirements
      }
    }
  } catch (error) {
    console.error('Failed to check token status:', error);
  }
};

const userService = {
  signup,
  signin,
  logout,
  googleSignin,
  refreshAccessToken,
  accessTokenStatus,
  checkAndLogTokenStatus,
};

export default userService;
