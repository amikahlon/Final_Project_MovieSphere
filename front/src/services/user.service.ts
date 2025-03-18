import axios from 'axios';
import { ProfileUser } from '../interfaces/user.intefaces';
import Cookies from 'js-cookie';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`;

const getMyProfile = async (): Promise<ProfileUser> => {
  const accessToken = Cookies.get('accessToken');
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

const updateUsername = async (username: string): Promise<ProfileUser> => {
  const accessToken = Cookies.get('accessToken');
  const response = await axios.put(
    `${API_URL}/update-username`,
    { username },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return response.data.user;
};

const uploadProfileImage = async (file: File): Promise<string> => {
  const accessToken = Cookies.get('accessToken');
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload-profile-image`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.imageUrl;
};

const updateProfilePicture = async (profilePicture: string): Promise<ProfileUser> => {
  const accessToken = Cookies.get('accessToken');
  const response = await axios.put(
    `${API_URL}/update-profile-picture`,
    { profilePicture },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return response.data.user;
};

const userService = {
  getMyProfile,
  updateUsername,
  uploadProfileImage,
  updateProfilePicture,
};

export default userService;
