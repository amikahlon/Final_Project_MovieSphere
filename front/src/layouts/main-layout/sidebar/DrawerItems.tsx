import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import { clearUser } from 'store/slices/userSlice';
import sitemap from 'routes/sitemap';
import logo from '../../../../public/logo.svg';
import api from '../../../../api';

const DrawerItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get the refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        // Call the backend API to invalidate the refresh token
        await api.post('/users/logout', { refreshToken });
      }

      // Clear all tokens and user-related data from localStorage
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken'); // Clear the access token

      // Clear user data from Redux store
      dispatch(clearUser());

      // Redirect to sign-in page
      navigate('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optional: Notify the user about the logout failure
    }
  };

  return (
    <>
      <Stack
        pt={2}
        pb={2}
        px={4.5}
        position="sticky"
        top={2}
        bgcolor="info.light"
        alignItems="center"
        justifyContent="center"
        borderBottom={1}
        borderColor="info.main"
        zIndex={1000}
      >
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={logo}
              alt="Venus Dashboard Logo"
              style={{ height: '60px', objectFit: 'contain' }}
            />
          </Box>
        </ButtonBase>
      </Stack>

      <List component="nav" sx={{ mt: 2.5, mb: 10, px: 4.5 }}>
        {sitemap.map((route) =>
          route.items ? (
            <CollapseListItem key={route.id} {...route} />
          ) : (
            <ListItem key={route.id} {...route} />
          ),
        )}
      </List>

      <Box mt="auto" px={3} pb={6}>
        <Button variant="text" onClick={handleLogout}>
          Log Out
        </Button>
      </Box>
    </>
  );
};

export default DrawerItems;
