import { useState, ChangeEvent, FormEvent } from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import { Person, Email, Lock } from '@mui/icons-material'; // Import icons
import paths from 'routes/paths';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import api from '../../../api';

interface User {
  username: string;
  email: string;
  password: string;
}

const Signup = () => {
  const [user, setUser] = useState<User>({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Regular signup
      const response = await api.post('/users/signup', user);
      const { accessToken, refreshToken } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      alert('Signup successful');
      window.location.href = '/'; // Redirect to homepage
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await api.post('/users/google-signup', {
        credential: credentialResponse.credential,
      });
      const { accessToken, refreshToken } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      alert('Google Signup successful');
      window.location.href = '/'; // Redirect to homepage
    } catch (error) {
      console.error('Google Signup error:', error);
      alert('Google Signup failed');
    }
  };

  return (
    <>
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

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
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
                  <Typography variant="body2">
                    {showPassword ? 'Hide' : 'Show'}
                  </Typography>
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
    </>
  );
};

export default Signup;
