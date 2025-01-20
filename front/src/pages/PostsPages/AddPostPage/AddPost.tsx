import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Rating,
  Button,
  IconButton,
  Container,
  Divider,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import movieService from '../../../services/movieApi.service';
import MovieCard from '../../../components/movies/MovieCard';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const ImagePreview = styled('img')`
  width: 180px;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3.5),
  borderRadius: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
  },
}));

const MovieGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Adjusted for smaller cards
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  justifyItems: 'center',
  maxHeight: '600px',
  overflowY: 'auto',
  marginTop: theme.spacing(3),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '8px',
    margin: theme.spacing(1),
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.12)',
    borderRadius: '8px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.18)',
    },
  },
}));

const EmptyStateBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: 'rgba(0, 0, 0, 0.4)',
  textAlign: 'center',
});

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shineAnimation = keyframes`
  0% { background-position: -100% }
  100% { background-position: 200% }
`;

const perfectScoreAnimation = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const RatingIndicator = styled(Box)<{ value: number }>(({ value, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: '16px',
  backgroundColor: value === 10 ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
  boxShadow: value === 10 ? '0 4px 20px rgba(255, 215, 0, 0.4)' : '0 3px 10px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  animation:
    value === 10 ? `${shineAnimation} 2s linear infinite` : `${pulseAnimation} 0.5s ease-in-out`,
  marginLeft: theme.spacing(3),
  border: '2px solid',
  borderColor:
    value === 10
      ? 'rgba(255, 215, 0, 0.8)'
      : value < 5
        ? 'rgba(255, 68, 68, 0.7)'
        : value < 8
          ? 'rgba(255, 160, 0, 0.7)'
          : 'rgba(76, 175, 80, 0.7)',
  background:
    value === 10
      ? 'linear-gradient(90deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.3) 25%, rgba(255,223,0,0.5) 50%, rgba(255,215,0,0.3) 75%, rgba(255,215,0,0.1) 100%)'
      : undefined,
  backgroundSize: '200% 100%',

  '& .number': {
    fontSize: value === 10 ? '2.5rem' : '2rem',
    fontWeight: 'bold',
    color: value === 10 ? '#FFD700' : value < 5 ? '#ff4444' : value < 8 ? '#ffa000' : '#4caf50',
    marginRight: theme.spacing(1),
    textShadow:
      value === 10 ? '0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3)' : 'none',
  },

  '& .label': {
    fontSize: value === 10 ? '1rem' : '0.875rem',
    color: value === 10 ? '#FFD700' : value < 5 ? '#ff4444' : value < 8 ? '#ffa000' : '#4caf50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textShadow: value === 10 ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
  },

  '& .emoji': {
    fontSize: value === 10 ? '2rem' : '1.5rem',
    marginLeft: theme.spacing(1),
    animation: value === 10 ? `${perfectScoreAnimation} 1s ease-in-out infinite` : 'none',
  },
}));

const EmptyRatingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginLeft: theme.spacing(3),
  minWidth: '120px',
  height: '80px',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '2px dashed rgba(0, 0, 0, 0.12)',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px dashed rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
  },
  '& .emoji': {
    fontSize: '1.8rem',
    marginBottom: theme.spacing(0.5),
    opacity: 0.7,
  },
  '& .text': {
    fontSize: '0.8rem',
    color: 'rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const AddPost = () => {
  const [movieQuery, setMovieQuery] = useState<string>('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [review, setReview] = useState<string>('');
  const [rating, setRating] = useState<number | null>(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearchMovie = async () => {
    setHasSearched(true);
    setLastSearchedQuery(movieQuery.trim());
    setIsLoading(true);

    if (!movieQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const results = (await movieService.searchMovies(movieQuery)) as Movie[];
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
      if (error instanceof Error) {
        alert(`Error searching for movies: ${error.message}`);
      } else {
        alert('An unknown error occurred while searching for movies.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log({
      searchResults,
      review,
      rating,
      images,
    });
  };

  const renderMovieGrid = () => {
    if (!hasSearched) {
      return null;
    }

    if (isLoading) {
      return (
        <EmptyStateBox>
          <CircularProgress size={50} sx={{ mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary">
            Searching for movies...
          </Typography>
        </EmptyStateBox>
      );
    }

    if (!lastSearchedQuery) {
      return (
        <EmptyStateBox>
          <SearchOffIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Please Enter a Movie Title
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type a movie title and click search
          </Typography>
        </EmptyStateBox>
      );
    }

    if (searchResults.length === 0) {
      return (
        <EmptyStateBox>
          <SearchOffIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Movies Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or check the spelling
          </Typography>
        </EmptyStateBox>
      );
    }

    return (
      <MovieGrid>
        {searchResults.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            imageUrl={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : ''}
            title={movie.title}
          />
        ))}
      </MovieGrid>
    );
  };

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
            <MovieIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main', opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="500" color="text.primary">
              Create Review
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Share your cinematic experience with the community
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormSection>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="500">
              Movie Selection
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Type movie title..."
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSearchMovie}
                disabled={isLoading}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
              </IconButton>
            </Box>
            {renderMovieGrid()}
          </FormSection>

          <FormSection>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="500">
              Your Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                max={10}
                sx={{
                  fontSize: '2rem',
                  '& .MuiRating-icon': {
                    color: 'primary.main',
                    opacity: 0.9,
                  },
                }}
              />
              {rating ? (
                <RatingIndicator value={rating}>
                  <span className="number">{rating}</span>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="label">
                      {rating === 10
                        ? 'MASTERPIECE'
                        : rating < 5
                          ? 'Poor'
                          : rating < 8
                            ? 'Good'
                            : 'Excellent'}
                    </span>
                    <span className="emoji">
                      {rating === 10 ? '🌟' : rating < 5 ? '😕' : rating < 8 ? '😊' : '🤩'}
                    </span>
                  </Box>
                </RatingIndicator>
              ) : (
                <EmptyRatingBox>
                  <span className="emoji">⭐</span>
                  <span className="text">Rate this movie</span>
                </EmptyRatingBox>
              )}
            </Box>
          </FormSection>

          <FormSection>
            <Typography variant="h5" gutterBottom fontWeight="500">
              Your Review
            </Typography>
            <TextField
              fullWidth
              placeholder="What did you think about this movie?"
              multiline
              rows={6}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />
          </FormSection>

          <FormSection>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="500">
              Visual Impressions
            </Typography>
            <Button
              component="label"
              variant="outlined"
              size="large"
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: 3,
                py: 1,
                px: 3,
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Upload Images
              <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
            </Button>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {previewUrls.map((url, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <ImagePreview src={url} alt={`Preview ${index + 1}`} />
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Submit Review
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default AddPost;
