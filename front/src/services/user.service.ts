import axios from 'axios';
import axiosInstance from './axios.service';
import { ProfileUser } from 'interfaces/user.intefaces';

const USER_API_URL = '/users';

const getMyProfile = async (): Promise<ProfileUser> => {
  try {
    const response = await axiosInstance.get(`${USER_API_URL}/me`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

const userService = {
  getMyProfile,
};

export default userService;
