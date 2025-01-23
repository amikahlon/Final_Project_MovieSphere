import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Person, Email, Lock } from '@mui/icons-material';
import paths from 'routes/paths';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import userService from '../../services/auth.service';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { signIn } from 'store/slices/userSlice';
import { Alert, AlertColor } from '@mui/material';

interface User {
  username: string;
  email: string;
  password: string;
}

const Signup = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User>({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    message: string;
    severity: AlertColor;
  }>({
    show: false,
    message: '',
    severity: 'info',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await userService.signup(user);
      console.log('Server response:', response); // הוספת לוג לבדיקת התשובה מהשרת

      const userData = {
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        profilePicture: response.user.profilePicture,
        favoriteGenres: Array.isArray(response.user.favoriteGenres)
          ? response.user.favoriteGenres
          : [],
      };

      console.log('Dispatching user data:', userData); // לוג לפני ה-dispatch
      dispatch(signIn(userData));

      Cookies.set('accessToken', response.accessToken, {
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      Cookies.set('refreshToken', response.refreshToken, {
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      navigate(paths.dashboard);
    } catch (error) {
      console.error('Signup error:', error);
      setAlertInfo({
        show: true,
        message: error instanceof Error ? error.message : 'Signup failed',
        severity: 'error',
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await userService.googleSignin(credentialResponse.credential!);
      console.log('Google signin response:', response); // הוספת לוג לבדיקת התשובה מהשרת

      const userData = {
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        profilePicture: response.user.profilePicture,
        favoriteGenres: Array.isArray(response.user.favoriteGenres)
          ? response.user.favoriteGenres
          : [],
      };

      console.log('Dispatching Google user data:', userData); // לוג לפני ה-dispatch
      dispatch(signIn(userData));

      Cookies.set('accessToken', response.accessToken, {
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      Cookies.set('refreshToken', response.refreshToken, {
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      navigate(paths.dashboard);
    } catch (error) {
      console.error('Google Signup error:', error);
      setAlertInfo({
        show: true,
        message: 'Google Signup failed',
        severity: 'error',
      });
    }
  };

  return (
    <Stack component="main" alignItems="center" justifyContent="center" width={1} minHeight="100vh">
      {/* Background Image and Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: -1,
        }}
      >
        {/* Background Image */}
        <div
          style={{
            backgroundImage: `url('/LoginBG.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100%',
            width: '100%',
          }}
        ></div>
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        ></div>
      </div>
      {/* Content */}
      <Paper
        sx={{
          px: { xs: 2, sm: 3.5 },
          py: 4,
          width: 1,
          maxWidth: 460,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        {alertInfo.show && (
          <Alert
            severity={alertInfo.severity}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            sx={{ mb: 2, width: '100%' }}
          >
            {alertInfo.message}
          </Alert>
        )}
        <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
          <img
            src="/logo.svg"
            alt="MovieSphere Logo"
            style={{
              width: '200px',
              height: 'auto',
            }}
          />
        </Box>

        <Typography align="center" variant="h4">
          Sign Up
        </Typography>
        <Typography mt={1.5} align="center" variant="body2" mb={2}>
          Let's Join us! Create an account with
        </Typography>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <GoogleLogin
            text="signup_with"
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Google Login Failed');
            }}
          />
        </div>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        <Stack component="form" mt={3} onSubmit={handleSubmit} direction="column" gap={2}>
          <TextField
            id="username"
            name="username"
            type="text"
            value={user.username}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Your Name"
            autoComplete="name"
            fullWidth
            autoFocus
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="email"
            name="email"
            type="email"
            value={user.email}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Your Email"
            autoComplete="email"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={user.password}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Your Password"
            autoComplete="current-password"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Typography variant="body2">{showPassword ? 'Hide' : 'Show'}</Typography>
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" size="medium" fullWidth sx={{ mt: 1.5 }}>
            Sign Up
          </Button>
        </Stack>

        <Typography mt={5} variant="body2" color="text.secondary" align="center">
          Already have an account? <Link href={paths.signin}>Sign In</Link>
        </Typography>
      </Paper>
    </Stack>
  );
};

export default Signup;
