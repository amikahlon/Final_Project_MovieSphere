import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
  Avatar,
  Button,
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import postService from 'services/post.service';
import { Post } from 'interfaces/post.intefaces';
import { MovieDetailDialog } from './MovieDetailDialog';
import { useNavigate } from 'react-router-dom';

// Simple in-memory cache: postId -> Post object
const postCache = new Map<string, Post>();

interface PostDetailsProps {
  postId: string;
}

const PostDetails: React.FC<PostDetailsProps> = ({ postId }) => {
  const [post, setPost] = useState<Post | null>(() => postCache.get(postId) || null);
  const [loading, setLoading] = useState<boolean>(!post); // Only show loading if not in cache
  const [error, setError] = useState<string | null>(null);
  const [openMovieDetail, setOpenMovieDetail] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(post?.hasLiked ?? null);

  const navigate = useNavigate(); // Initialize navigate function

  // Fetch post data if not in cache
  useEffect(() => {
    if (post) return; // If cached, skip fetching

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await postService.getPostById(postId);
        postCache.set(postId, fetchedPost); // Cache the post
        setPost(fetchedPost);
        setIsLiked(fetchedPost.hasLiked); // Initialize like state
      } catch (err) {
        console.error(err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, post]);

  // Handle like toggling
  const handleLike = async () => {
    if (!post) return;

    try {
      if (isLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
      const updatedLiked = !isLiked;
      setIsLiked(updatedLiked);

      // Update cache
      const updatedPost = { ...post };
      postCache.set(postId, updatedPost);
      setPost(updatedPost);
    } catch (err) {
      console.error('Failed to update likes', err);
    }
  };

  // Redirect function
  const redirectToPost = () => {
    navigate(`/posts/${postId}`);
  };

  // Helper to render the rating label
  const renderRatingLabel = (rating: number) => {
    if (rating >= 9.5) return '🌟 Extraordinary';
    if (rating >= 8) return '🤩 Excellent';
    if (rating >= 6) return '😊 Good';
    return '😕 Average';
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
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
    post && <Box
      sx={{
        width: '100%',
        bgcolor: '#f5f5f5',
        maxHeight: '630px',
        overflow: 'hidden', // Ensures content stays within the container
      }}
    >
      <MovieDetailDialog
        open={openMovieDetail}
        onClose={() => setOpenMovieDetail(false)}
        movieId={parseInt(post.movieId)}
      />

      <Paper
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'auto', // Enables scrolling for content
          background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          margin: '0 auto',
          padding:'0'
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar
            src="/placeholder-avatar.png" // Replace with user avatar if available
            sx={{
              width: 80,
              height: 80,
              border: '3px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          />
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {post.user.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <StarIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {post.rating}/10
              </Typography>
              <Typography variant="subtitle1" sx={{ ml: 2 }}>
                {renderRatingLabel(post.rating)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3, backgroundColor: 'white' }}>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Left Side - Review Content */}
            <Grid item xs={12} md={9}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {post.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  wordBreak: 'break-word', // Ensures long words break properly
                  overflowWrap: 'anywhere', // Allows breaking on long unbreakable text like URLs
                  maxWidth: '100%', // Prevents the text from exceeding the container width
                  maxHeight:'100px',
                  overflow:'auto'
                }}
              >
                {post.review}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 3 }}>
                {post.images.map((image: string, index: React.Key | null | undefined) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      <img
                        src={`http://localhost:${import.meta.env.VITE_SERVER_PORT}${image}`}
                        alt={`Image ${index}`}
                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {/* Like Button */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleLike} color="primary">
                  {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                </IconButton>
                <Typography variant="body1">
                  {post.hasLiked ?
                    isLiked ? post.likes.length : post.likes.length - 1
                    :
                    isLiked ? post.likes.length + 1 : post.likes.length} 
                    {' '}
                    {post.likes.length === 1 ? 'Like' : 'Likes'}
                </Typography>

                <IconButton onClick={redirectToPost} color="primary">
                  <CommentIcon />
                </IconButton>
                <Typography variant="body1">
                  {post.commentsCount}
                  {' '}
                  {post.commentsCount === 1 ? 'Comment' : 'Comments'}
                </Typography>
              </Box>
            </Grid>

            {/* Right Side - Movie Quick Info Card */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: '#f8f9fa',
                  position: 'sticky',
                  top: 24,
                  maxHeight:'475px'
                }}
              >
                <Box
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { '& img': { transform: 'scale(1.03)' } },
                  }}
                  onClick={() => setOpenMovieDetail(true)}
                >
                  <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                  <img
                    src={post.moviePosterURL}
                    alt={post.movieName}
                    style={{
                      maxHeight:'300px',
                      borderRadius: 4,
                      marginBottom: '8px',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  </div>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {post.movieName}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMovieDetail(true);
                    }}
                  >
                    More Details
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default PostDetails;
