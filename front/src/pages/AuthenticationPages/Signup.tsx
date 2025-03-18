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
import { Person, Email, Lock, AddAPhoto, Delete } from '@mui/icons-material';
import paths from 'routes/paths';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import userService from '../../services/auth.service';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { signIn } from 'store/slices/userSlice';
import { Alert, AlertColor, Avatar } from '@mui/material';

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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
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

  const handleProfileImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const handleRemoveProfileImage = () => {
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleProfileImageClick = () => {
    const fileInput = document.getElementById('profile-image-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Create a FormData object if there's a profile image
      if (profileImage) {
        const formData = new FormData();
        formData.append('email', user.email);
        formData.append('password', user.password);
        formData.append('username', user.username);

        // This is critical - the field name must match what the server's multer config expects
        // Looking at your server code, it seems 'profileUrl' is just a string path, not the actual file
        // Let's try with the field name 'profileImage' as that might be what multer is configured to look for
        formData.append('profileImage', profileImage, profileImage.name);

        console.log('Submitting signup with profile image:', profileImage.name);
        console.log('FormData:', formData);

        const response = await userService.signup(formData);
        console.log('Server response:', response);

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

        console.log('Dispatching user data:', userData);
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
      } else {
        // Regular signup without profile image
        const response = await userService.signup(user);
        console.log('Server response:', response);

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

        console.log('Dispatching user data:', userData);
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
      }
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
      console.log('Google signin response:', response);

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

      console.log('Dispatching Google user data:', userData);
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
          {/* Profile Image Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" color="text.secondary" mb={1}>
              Profile Picture (optional)
            </Typography>

            <input
              type="file"
              id="profile-image-input"
              hidden
              accept="image/*"
              onChange={handleProfileImageUpload}
            />

            {profileImagePreview ? (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileImagePreview}
                  alt="Profile Preview"
                  sx={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                  onClick={handleProfileImageClick}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                  }}
                  onClick={handleRemoveProfileImage}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={handleProfileImageClick}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <AddAPhoto sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                <Typography variant="caption" color="text.secondary" mt={1}>
                  Choose Image
                </Typography>
              </Box>
            )}
          </Box>

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
