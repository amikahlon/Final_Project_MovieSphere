import axios from 'axios';
import { SignInResponse, SignUpResponse, LogoutResponse } from '../interfaces/auth.interfaces';

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

const userService = {
  signup,
  signin,
  logout,
  googleSignin,
};

export default userService;
