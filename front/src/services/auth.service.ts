import axios from 'axios';
import { SignInResponse, SignUpResponse, LogoutResponse } from '../interfaces/auth.interfaces';
import { updateTokens } from '../store/slices/userSlice';
import { Dispatch } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api/users';

// Add a function to upload profile images first
const uploadProfileImage = async (imageFile: File): Promise<string> => {
  try {
    // Create a FormData object for the file upload
    const formData = new FormData();
    formData.append('file', imageFile);

    // Make upload request to the image upload endpoint
    const response = await axios.post(`${API_URL}/upload-profile-image`, formData);
    return response.data.imageUrl; // Return the URL of the uploaded image
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Image upload failed:', error.response.data);
      throw new Error(error.response.data.message || 'Image upload failed');
    }
    throw new Error('Image upload failed');
  }
};

const signup = async (
  userData:
    | {
        email: string;
        password: string;
        username: string;
      }
    | FormData,
): Promise<SignUpResponse> => {
  try {
    // Check if userData is FormData (contains profile image)
    const isFormData = userData instanceof FormData;
    let dataToSend: { email: string; password: string; username: string; profileUrl?: string };

    if (isFormData) {
      // Extract the profile image file from FormData
      const profileImage = userData.get('profileImage') as File | null;

      // Extract other fields from FormData
      const email = userData.get('email') as string;
      const password = userData.get('password') as string;
      const username = userData.get('username') as string;

      // Prepare the data object for API call
      dataToSend = {
        email,
        password,
        username,
      };

      // If profile image exists, add the profileUrl field
      if (profileImage) {
        try {
          // First upload the image file to get a URL
          const profileUrl = await uploadProfileImage(profileImage);
          // Then add the URL to the data object
          dataToSend.profileUrl = profileUrl;
        } catch (uploadError) {
          console.error('Failed to upload profile image:', uploadError);
          // Continue with signup without profile image
        }
      }

      console.log('Sending signup with data:', dataToSend);
    } else {
      // Regular signup without profile image
      dataToSend = userData;
    }

    // Make the signup request with the prepared data
    const response = await axios.post(`${API_URL}/signup`, dataToSend);

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Signup failed with server response:', error.response.data);
      throw new Error(error.response.data.message || 'Signup failed');
    }
    console.error('Signup failed:', error);
    throw new Error('Signup failed. Please try again.');
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

const refreshAccessToken = async (dispatch?: Dispatch) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${API_URL}/refresh-access-token`, { refreshToken });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      if (dispatch) dispatch(updateTokens(response.data));
      window.dispatchEvent(new Event('tokenUpdated'));
    }
    return response.data;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
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

const checkAndLogTokenStatus = async (dispatch?: Dispatch) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || isTokenExpiringSoon(accessToken)) {
      await refreshAccessToken(dispatch);
    }
  } catch (error) {
    console.error('Failed to check token status:', error);
  }
};

const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return exp - Date.now() < 5 * 60 * 1000;
  } catch (error) {
    return true;
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
  isTokenExpiringSoon,
};

export default userService;
