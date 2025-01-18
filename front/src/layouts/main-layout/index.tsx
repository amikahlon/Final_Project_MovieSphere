import { useState, useEffect, PropsWithChildren } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, clearUser } from 'store/slices/userSlice';
import Stack from '@mui/material/Stack';
import Sidebar from 'layouts/main-layout/sidebar';
import Topbar from 'layouts/main-layout/topbar';
import Footer from './footer';
import api from '../../../api';

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
  
      if (!refreshToken) {
          dispatch(clearUser());
          navigate('/auth/signin');
          return;
      }
  
      try {
          // Validate the access token
          const response = await api.get('/users/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
          });
  
          const { user } = response.data;
          dispatch(setUser(user));
      } catch (error) {
          console.error('Access token expired, refreshing token:', error);
  
          try {
              // Refresh tokens
              const refreshResponse = await api.post('/users/refresh-token', { refreshToken });
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
  
              // Update tokens in localStorage
              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
  
              // Retry `/users/me`
              const userResponse = await api.get('/users/me', {
                  headers: { Authorization: `Bearer ${newAccessToken}` },
              });
  
              const { user } = userResponse.data;
              dispatch(setUser(user));
          } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
  
              // Clear tokens and state
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              dispatch(clearUser());
              navigate('/auth/signin');
          }
      }
  };

    authenticateUser();
}, [dispatch, navigate]);

  return (
    <Stack width={1} minHeight="100vh">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} setIsClosing={setIsClosing} />
      <Stack
        component="main"
        direction="column"
        px={3}
        width={{ xs: 1, lg: `calc(100% - 300px)` }}
        flexGrow={1}
      >
        <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        {children}
        <Footer />
      </Stack>
    </Stack>
  );
};

export default MainLayout;
