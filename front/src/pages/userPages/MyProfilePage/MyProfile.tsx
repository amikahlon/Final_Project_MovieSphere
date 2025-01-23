import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import styled from '@emotion/styled';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import userService from '../../../services/user.service';
import { ProfileUser } from '../../../interfaces/user.intefaces';

const ProfileHeader = styled(Paper)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProfileAvatar = styled(Avatar)`
  width: 150px;
  height: 150px;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.5rem;
`;

const UserInfoSection = styled(Box)`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  color: rgba(0, 0, 0, 0.7);
`;

const GenreSection = styled(Box)`
  background: rgba(255, 255, 255, 0.94);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const GenreChip = styled(Chip)`
  margin: 0.5rem;
  padding: 1.2rem 1rem;
  font-size: 1rem;
  background: linear-gradient(135deg, rgba(107, 141, 214, 0.7) 0%, rgba(142, 55, 215, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border-radius: 25px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(107, 141, 214, 0.2);
    background: linear-gradient(135deg, rgba(107, 141, 214, 0.9) 0%, rgba(142, 55, 215, 0.9) 100%);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const NameSection = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const EditButton = styled(IconButton)`
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const MyProfile = () => {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await userService.getMyProfile();
        setProfile(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>No profile data available</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent',
        pt: 4,
        pb: 6,
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
            }}
          >
            <AccountBoxIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main', opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="500" color="text.primary">
              My Profile
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Manage your profile and preferences
          </Typography>
        </Box>

        <ProfileHeader elevation={0}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <ProfileAvatar src={profile.profilePicture} alt={profile.username} />
              <Tooltip title="Edit Profile Picture">
                <EditButton
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 0,
                  }}
                >
                  <EditIcon />
                </EditButton>
              </Tooltip>
            </Box>

            <NameSection>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {profile.username}
              </Typography>
              <Tooltip title="Edit Name">
                <EditButton size="small">
                  <EditIcon />
                </EditButton>
              </Tooltip>
            </NameSection>

            <UserInfoSection>
              <EmailIcon sx={{ mr: 1, opacity: 0.8 }} />
              <Typography variant="body1">{profile.email}</Typography>
            </UserInfoSection>
          </Box>
        </ProfileHeader>

        <GenreSection>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocalMoviesIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main', opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="500" color="text.primary">
              Favorite Genres
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem 0',
            }}
          >
            {profile.favoriteGenres.map((genre) => (
              <GenreChip
                key={genre}
                label={genre}
                onClick={() => {}}
                sx={{
                  '& .MuiChip-label': {
                    padding: '0 16px',
                  },
                }}
              />
            ))}
          </Box>
        </GenreSection>
      </Container>
    </Box>
  );
};

export default MyProfile;
