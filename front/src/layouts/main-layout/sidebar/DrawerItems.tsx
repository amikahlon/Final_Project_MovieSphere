import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import ListItem from './list-items/ListItem';
import paths from 'routes/paths';
import logo from '../../../../public/logo.svg';

const DrawerItems = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: paths.dashboard },
    { id: 'signin', label: 'Sign In', path: paths.signin },
    { id: 'signup', label: 'Sign Up', path: paths.signup },
    { id: 'addpost', label: 'Add Post', path: paths.addpost },
  ];

  const handleLogout = async () => {
    console.log('Logout clicked');
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
        {menuItems.map((route) => (
          <ListItem key={route.id} {...route} />
        ))}
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
