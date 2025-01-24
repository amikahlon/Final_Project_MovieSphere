import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  runtime: number;
  posterUrl: string;
  synopsis: string;
}

const MovieDetailDialog = ({
  open,
  onClose,
  movie,
}: {
  open: boolean;
  onClose: () => void;
  movie: Movie;
  movieId: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            {movie.title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{
                width: '100%',
                borderRadius: 8,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Synopsis
              </Typography>
              <Typography>{movie.synopsis}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Director
                </Typography>
                <Typography>{movie.director}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Release Year
                </Typography>
                <Typography>{movie.year}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Runtime
                </Typography>
                <Typography>{movie.runtime} min</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const PostDetails: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [expandedReview, setExpandedReview] = useState(false);
  const [openMovieDetail, setOpenMovieDetail] = useState(false);

  const demoPost = {
    user: {
      name: 'Elena Cinemascape',
      avatar: '/api/placeholder/80/80',
    },
    movie: {
      id: 'movie123',
      title: 'Dune: Part Two',
      director: 'Denis Villeneuve',
      year: 2024,
      runtime: 166,
      posterUrl: '/api/placeholder/300/450',
      synopsis:
        'Paul Atreides unites with Chani and the Fremen to seek revenge against those who destroyed his family, facing difficult choices in a war for the most precious resource in the universe.',
    },
    review: {
      title: 'An Epic Sci-Fi Masterpiece',
      content:
        "Villeneuve transforms Frank Herbert's complex narrative into a breathtaking cinematic experience. Every frame is meticulously crafted, blending stunning visual effects with profound storytelling. Timothée Chalamet and Zendaya deliver performances that transcend the typical sci-fi genre, bringing depth and nuance to their characters.",
      rating: 9.5,
    },
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200'],
    stats: {
      likes: 342,
      comments: 57,
    },
  };

  const renderRatingLabel = (rating: number) => {
    if (rating >= 9.5) return '🌟 Extraordinary';
    if (rating >= 8) return '🤩 Excellent';
    if (rating >= 6) return '😊 Good';
    return '😕 Average';
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: 4 }}>
      <MovieDetailDialog
        open={openMovieDetail}
        onClose={() => setOpenMovieDetail(false)}
        movie={demoPost.movie}
        movieId={demoPost.movie.id}
      />

      <Paper
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
          position: 'relative',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Header with User Info - remains unchanged */}
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
            src={demoPost.user.avatar}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          />
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {demoPost.user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <StarIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {demoPost.review.rating}/10
              </Typography>
              <Typography variant="subtitle1" sx={{ ml: 2 }}>
                {renderRatingLabel(demoPost.review.rating)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3, backgroundColor: 'white' }}>
          <Grid container spacing={3}>
            {/* Left side - Review Content */}
            <Grid item xs={12} md={9}>
              {/* Review Title and Content */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {demoPost.review.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  maxHeight: expandedReview ? 'none' : 200,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::after': !expandedReview
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: 100,
                        background: 'linear-gradient(transparent, white)',
                      }
                    : {},
                }}
              >
                {demoPost.review.content}
              </Typography>
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  onClick={() => setExpandedReview(!expandedReview)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {expandedReview ? 'Show Less' : 'Read More'}
                </Typography>
              </Box>

              {/* Images */}
              <Grid container spacing={2} sx={{ mt: 3 }}>
                {demoPost.images.map((image, index) => (
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
                        src={image}
                        alt={`Scene ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Interactions */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mt: 3,
                  pt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <Tooltip title="Like">
                  <IconButton onClick={() => setLiked(!liked)}>
                    {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {liked ? demoPost.stats.likes + 1 : demoPost.stats.likes}
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Comments">
                  <IconButton>
                    <CommentIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {demoPost.stats.comments}
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Right side - Movie Quick Info Card */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: '#f8f9fa',
                  position: 'sticky',
                  top: 24,
                }}
              >
                <Box
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { '& img': { transform: 'scale(1.03)' } },
                  }}
                  onClick={() => setOpenMovieDetail(true)}
                >
                  <img
                    src={demoPost.movie.posterUrl}
                    alt={demoPost.movie.title}
                    style={{
                      width: '100%',
                      borderRadius: 4,
                      marginBottom: '8px',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {demoPost.movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {demoPost.movie.director}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {demoPost.movie.year} • {demoPost.movie.runtime} min
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
                      console.log('Movie ID:', demoPost.movie.id);
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
