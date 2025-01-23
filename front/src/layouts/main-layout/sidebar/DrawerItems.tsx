import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import ListItem from './list-items/ListItem';
import paths from 'routes/paths';
import logo from '../../../../public/logo.svg';
// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

interface DrawerItemsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const DrawerItems = ({ isCollapsed, onToggleCollapse }: DrawerItemsProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: paths.dashboard, icon: <DashboardIcon /> },
    { id: 'signin', label: 'Sign In', path: paths.signin, icon: <LoginIcon /> },
    { id: 'signup', label: 'Sign Up', path: paths.signup, icon: <PersonAddIcon /> },
    { id: 'addpost', label: 'Add Post', path: paths.addpost, icon: <AddBoxIcon /> },
    { id: 'myprofile', label: 'My Profile', path: paths.myprofile, icon: <PersonIcon /> },
  ];

  const handleLogout = async () => {
    console.log('Logout clicked');
  };

  return (
    <>
      <Stack
        pt={1.5}
        pb={1.5}
        px={2}
        position="sticky"
        top={2}
        bgcolor="info.light"
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        borderBottom={1}
        borderColor="info.main"
        zIndex={1000}
      >
        {!isCollapsed && (
          <ButtonBase
            component={Link}
            href="/"
            disableRipple
            sx={{
              height: '60px',
              flex: 1,
              justifyContent: 'center', // Changed from flex-start to center
              ml: 3, // Added margin-left to move logo right
            }}
          >
            <Box>
              <img
                src={logo}
                alt="Venus Dashboard Logo"
                style={{
                  height: '45px',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </ButtonBase>
        )}
        <IconButton
          onClick={onToggleCollapse}
          sx={{
            width: 35,
            height: 35,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {isCollapsed ? <MenuIcon sx={{ fontSize: 20 }} /> : <CloseIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Stack>

      <List component="nav" sx={{ mt: 2.5, mb: 10, px: isCollapsed ? 1 : 4.5 }}>
        {menuItems.map((route) => (
          <ListItem key={route.id} {...route} isCollapsed={isCollapsed} />
        ))}
      </List>

      {!isCollapsed && (
        <Box mt="auto" px={4.5} pb={6}>
          <Button
            variant="text"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: '20px', color: 'text.secondary' }} />}
            sx={{
              py: 1.5,
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      )}
    </>
  );
};

export default DrawerItems;
