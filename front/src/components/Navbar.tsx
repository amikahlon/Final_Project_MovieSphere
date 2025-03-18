import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import postService from 'services/post.service';
import PostDetails from 'components/PostDetails';
import { Post } from 'interfaces/post.intefaces';

const MyReviews: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await postService.getCurrentUserPosts();
        setPosts(response);
      } catch (err) {
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Reviews
      </Typography>
      {posts.length === 0 ? (
        <Typography variant="body1">You have not posted any reviews yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} key={post._id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <PostDetails postId={post._id} />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  View Full Review
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyReviews;
