import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import styled from '@emotion/styled';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import userService from '../../../services/user.service';
import { ProfileUser } from '../../../interfaces/user.intefaces';
import { useDispatch } from 'react-redux';
import {
  updateUsername as updateUsernameAction,
  updateProfilePicture as updateProfilePictureAction,
} from '../../../store/slices/userSlice';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

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

  // States for username editing
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New states for profile picture editing
  const [isEditPhotoDialogOpen, setIsEditPhotoDialogOpen] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const dispatch = useDispatch();

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

  // New handlers for username update
  const handleEditNameClick = () => {
    if (profile) {
      setNewUsername(profile.username);
      setIsEditNameDialogOpen(true);
    }
  };

  const handleNameDialogClose = () => {
    setIsEditNameDialogOpen(false);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(event.target.value);
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setSnackbar({
        open: true,
        message: 'Username cannot be empty',
        severity: 'error',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await userService.updateUsername(newUsername);
      setProfile(updatedUser);

      // Update username in Redux store
      dispatch(updateUsernameAction(newUsername));

      setSnackbar({
        open: true,
        message: 'Username updated successfully',
        severity: 'success',
      });
      handleNameDialogClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update username',
        severity: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Profile picture update handlers
  const handleEditPhotoClick = () => {
    setIsEditPhotoDialogOpen(true);
  };

  const handlePhotoDialogClose = () => {
    setIsEditPhotoDialogOpen(false);
    // Clear the preview and file selection when closing the dialog
    setNewProfileImage(null);
    if (newProfileImagePreview) {
      URL.revokeObjectURL(newProfileImagePreview);
      setNewProfileImagePreview(null);
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Clean up the previous preview URL if it exists
      if (newProfileImagePreview) {
        URL.revokeObjectURL(newProfileImagePreview);
      }

      const file = event.target.files[0];
      setNewProfileImage(file);

      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setNewProfileImagePreview(previewUrl);
    }
  };

  const handleProfileImageUpdate = async () => {
    if (!newProfileImage) {
      setSnackbar({
        open: true,
        message: 'Please select an image',
        severity: 'error',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      // Step 1: Upload the image to the server
      const imageUrl = await userService.uploadProfileImage(newProfileImage);

      // Step 2: Update the user's profile with the new image URL
      const updatedUser = await userService.updateProfilePicture(imageUrl);

      // Step 3: Update local state
      setProfile(updatedUser);

      // Step 4: Update Redux store
      dispatch(updateProfilePictureAction(imageUrl));

      setSnackbar({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success',
      });
      handlePhotoDialogClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update profile picture',
        severity: 'error',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Helper function to get the complete profile picture URL
  const getProfilePictureUrl = (path: string) => {
    // Check if path is a full URL or a relative path
    if (path && !path.startsWith('http')) {
      return `http://localhost:${import.meta.env.VITE_SERVER_PORT}${path}`;
    }
    return path || '/placeholder-avatar.png'; // Fallback to placeholder if no image
  };

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
              <ProfileAvatar
                src={getProfilePictureUrl(profile.profilePicture)}
                alt={profile.username}
              />
              <Tooltip title="Edit Profile Picture">
                <EditButton
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 0,
                  }}
                  onClick={handleEditPhotoClick}
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
                <EditButton size="small" onClick={handleEditNameClick}>
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
      </Container>

      {/* Username Edit Dialog */}
      <Dialog open={isEditNameDialogOpen} onClose={handleNameDialogClose}>
        <DialogTitle>Update Username</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={newUsername}
            onChange={handleUsernameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNameDialogClose}>Cancel</Button>
          <Button onClick={handleUsernameUpdate} color="primary" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Picture Edit Dialog */}
      <Dialog open={isEditPhotoDialogOpen} onClose={handlePhotoDialogClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 2 }}
          >
            {newProfileImagePreview ? (
              <Avatar
                src={newProfileImagePreview}
                alt="New Profile Image"
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main',
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AddAPhotoIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5 }} />
              </Avatar>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<AddAPhotoIcon />}
              sx={{ mt: 1 }}
            >
              Choose Image
              <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhotoDialogClose}>Cancel</Button>
          <Button
            onClick={handleProfileImageUpdate}
            color="primary"
            disabled={isUploadingImage || !newProfileImage}
          >
            {isUploadingImage ? 'Uploading...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfile;
