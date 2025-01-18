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
import GoogleIcon from '@mui/icons-material/Google';
import paths from 'routes/paths';

interface User {
  [key: string]: string;
}

const Signup = () => {
  const [user, setUser] = useState<User>({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(user);
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in clicked');
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
      <Typography mt={1.5} align="center" variant="body2" mb={4}>
        Let's Join us! create account with
      </Typography>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        sx={{
          mb: 3,
          color: 'text.primary',
          borderColor: 'grey.300',
          textTransform: 'none',
          '&:hover': {
            borderColor: 'grey.400',
            bgcolor: 'grey.50',
          },
        }}
      >
        Continue with Google
      </Button>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>

      <Stack component="form" mt={3} onSubmit={handleSubmit} direction="column" gap={2}>
        <TextField
          id="name"
          name="name"
          type="text"
          value={user.name}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Your Name"
          autoComplete="name"
          fullWidth
          autoFocus
          required
          InputProps={{
            startAdornment: <InputAdornment position="start"></InputAdornment>,
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
            startAdornment: <InputAdornment position="start"></InputAdornment>,
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
            startAdornment: <InputAdornment position="start"></InputAdornment>,
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{
                  opacity: user.password ? 1 : 0,
                  pointerEvents: user.password ? 'auto' : 'none',
                }}
              >
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ border: 'none', bgcolor: 'transparent !important' }}
                  edge="end"
                ></IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" size="medium" fullWidth sx={{ mt: 1.5 }}>
          Sign Up
        </Button>
      </Stack>

      <Typography mt={5} variant="body2" color="text.secondary" align="center" letterSpacing={0.25}>
        Already have an account? <Link href={paths.signin}>Signin</Link>
      </Typography>
    </>
  );
};

export default Signup;
