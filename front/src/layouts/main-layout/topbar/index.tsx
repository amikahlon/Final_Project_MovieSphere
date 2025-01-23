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
import Button from '@mui/material/Button';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { alpha, Theme } from '@mui/material/styles';
import { theme } from 'theme/theme';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Add these new styled components
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(142, 55, 215, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(142, 55, 215, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(142, 55, 215, 0);
  }
`;

const GenreButton = styled(Button)`
  background: linear-gradient(135deg, rgba(107, 141, 214, 0.9) 0%, rgba(142, 55, 215, 0.9) 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  text-transform: none;
  font-weight: 600;
  animation: ${pulse} 2s infinite;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(107, 141, 214, 1) 0%, rgba(142, 55, 215, 1) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(142, 55, 215, 0.3);
  }

  @media (max-width: 600px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

const MobileGenreIcon = styled(LocalMoviesIcon)`
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const WelcomeContainer = styled(Stack)<{ theme: Theme }>`
  background: ${({ theme }) => alpha(theme.palette.primary.main, 0.08)};
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => alpha(theme.palette.primary.main, 0.15)};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(142, 55, 215, 0.15);
  }

  @media (max-width: 600px) {
    padding: 4px 12px;
  }
`;

const WelcomeText = styled(Typography)`
  background: linear-gradient(135deg, #6b8dd6 0%, #8e37d7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  letter-spacing: 0.3px;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

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
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user.user);
  console.log(userData);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleProfileClick = () => {
    navigate('/users/myprofile');
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

      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
        <GenreButton
          startIcon={<MobileGenreIcon />}
          onClick={() => {}}
          sx={{
            display: 'flex',
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Choose your favorite genres</Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Genres</Box>
        </GenreButton>

        <WelcomeContainer
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          alignItems="center"
          theme={theme}
          onClick={handleProfileClick}
          sx={{
            '&:hover': {
              '& .MuiAvatar-root': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease-in-out',
              },
            },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              bgcolor: 'primary.main',
              display: 'flex',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            src={userData?.profilePicture || ''}
          >
            {userData ? userData.username.charAt(0).toUpperCase() : 'G'}
          </Avatar>
          <WelcomeText
            variant="subtitle1"
            sx={{
              display: 'block',
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            }}
          >
            {userData ? `${userData.username}` : 'Guest'}
          </WelcomeText>
        </WelcomeContainer>
      </Stack>
    </Stack>
  );
};

export default Topbar;
