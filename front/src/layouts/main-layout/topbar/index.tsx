import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface RootState {
  user: {
    user: {
      username: string;
      profilePicture: string;
    } | null;
  };
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const userData = useSelector((state: RootState) => state.user.user);
  console.log(userData);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      py={2}
      px={2}
      alignItems="center"
      justifyContent="space-between"
      bgcolor="transparent"
      zIndex={1200}
      direction="row"
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center" direction="row">
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{ lineHeight: 0, display: { xs: 'none', sm: 'block', lg: 'none' } }}
        ></ButtonBase>

        <Toolbar sx={{ display: { xs: 'block', lg: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>

        <Toolbar sx={{ ml: -1.5, display: { xs: 'block', md: 'none' } }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="search">
            <SearchIcon />
          </IconButton>
        </Toolbar>

        <TextField
          variant="filled"
          placeholder="Search"
          sx={{ width: { xs: '100%', md: 340 }, display: { xs: 'none', md: 'flex' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            display: { xs: 'none', sm: 'flex' },
          }}
          src={userData?.profilePicture || ''}
        >
          {userData ? userData.username.charAt(0).toUpperCase() : 'G'}
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {userData ? `Welcome, ${userData.username}` : 'Welcome, Guest'}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Topbar;
