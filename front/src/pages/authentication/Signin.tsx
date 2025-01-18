import { useState, ChangeEvent, FormEvent } from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import paths from 'routes/paths';
import GoogleIcon from '@mui/icons-material/Google';
import { Divider } from '@mui/material';

interface User {
  [key: string]: string;
}

const Signin = () => {
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(user);
  };

  const handleGoogleSignIn = () => {
    // Add Google sign-in logic here
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
        Sign In
      </Typography>
      <Typography mt={1.5} align="center" variant="body2" mb={4}>
        Welcome back! Please enter your details
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
          id="email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Your Email"
          autoComplete="email"
          fullWidth
          autoFocus
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

        <Stack mt={-1.25} alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox id="checkbox" name="checkbox" size="medium" color="primary" />}
            label="Remember me"
            sx={{ ml: -0.75 }}
          />
          <Link href="#!" fontSize="body2.fontSize">
            Forgot password?
          </Link>
        </Stack>

        <Button type="submit" variant="contained" size="medium" fullWidth>
          Sign In
        </Button>
      </Stack>

      <Typography mt={5} variant="body2" color="text.secondary" align="center" letterSpacing={0.25}>
        Don't have an account? <Link href={paths.signup}>Signup</Link>
      </Typography>
    </>
  );
};

export default Signin;
