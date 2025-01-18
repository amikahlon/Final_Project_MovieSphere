import { useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store/slices/userSlice';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import paths from 'routes/paths';
import api from '../../../api';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

interface User {
    email: string;
    password: string;
}

const Signin = () => {
    const [user, setUserForm] = useState<User>({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserForm({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/signin', user);
            const { accessToken, refreshToken, user: authenticatedUser } = response.data;

            // Dispatch user to Redux store
            dispatch(setUser(authenticatedUser));

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            alert('Sign in successful');
            navigate('/');
        } catch (error) {
            console.error('Sign in error:', error);
            alert('Sign in failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const response = await api.post('/users/google-signin', {
                credential: credentialResponse.credential,
            });

            const { accessToken, refreshToken, user: authenticatedUser } = response.data;

            // Dispatch user to Redux store
            dispatch(setUser(authenticatedUser));

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            alert('Google Sign in successful');
            navigate('/');
        } catch (error) {
            console.error('Google Sign in error:', error);
            alert('Google Sign in failed');
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
                Sign In
            </Typography>
            <Typography mt={1.5} align="center" variant="body2" mb={2}>
                Welcome back! Please enter your details
            </Typography>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        console.error('Google Sign in failed');
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
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon />
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
                                <LockIcon />
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
