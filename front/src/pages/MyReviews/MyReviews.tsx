import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Button, Dialog, CircularProgress } from '@mui/material';
import PostDetails from 'components/PostDetails';
import postService from 'services/post.service';
import { Post } from 'interfaces/post.intefaces';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const MyReviews: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user's posts on component mount
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = (await postService.getCurrentUserPosts()) as { posts: Post[] } | Post[];
        setPosts(Array.isArray(response) ? response : response.posts);
      } catch (err) {
        setError('Failed to load your reviews. Please try again later.');
        console.error('Error fetching user posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  // Delete post
  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await postService.deletePost(postToDelete);
      // Remove the deleted post from state
      setPosts(posts.filter((post) => post._id !== postToDelete));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };

  // Handle edit navigation
  const handleEditClick = (postId: string) => {
    console.log('Navigating to edit post:', `/edit-post/${postId}`); // Debug log
    navigate(`/edit-post/${postId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box my={4} textAlign="center">
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
            My Reviews
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Manage and browse your movie reviews
        </Typography>
      </Box>

      {posts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6">You haven't posted any reviews yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid item xs={12} key={post._id}>
              <Box position="relative">
                <PostDetails postId={post._id} />

                {/* Edit/Delete buttons overlay */}
                <Box
                  position="absolute"
                  top={10}
                  right={10}
                  zIndex={1}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    padding: '4px',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(post._id)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(post._id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box p={3} minWidth={300}>
          <Typography variant="h6" gutterBottom>
            Confirm Delete
          </Typography>
          <Typography variant="body1">
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default MyReviews;
