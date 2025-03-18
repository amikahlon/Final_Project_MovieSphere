import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import movieService from '../../../services/movieApi.service';
import MovieCard from '../../../components/movies/MovieCard';
import {
  ImagePreview,
  FormSection,
  MovieGrid,
  EmptyStateBox,
  RatingIndicator,
  ImageUploadBox,
  ImagePreviewContainer,
  EmptyRatingBox,
  RatingContainer,
} from './style';
import postService from 'services/post.service';
import { showErrorToast, showSuccessToast } from 'components/toastUtils';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const AddPost = () => {
  const navigate = useNavigate();
  const [movieQuery, setMovieQuery] = useState<string>('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [review, setReview] = useState<string>('');
  const [rating, setRating] = useState<number | null>(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');

  const handleImageUploadClick = () => {
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

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
    event.target.value = '';
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

  const handleMovieSelect = (id: number) => {
    setSelectedMovieId(id === selectedMovieId ? null : id);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedMovieId) {
      alert('Please select a movie before submitting your review.');
      return;
    }

    try {
      // Fetch movie details
      const movieDetails = await movieService.getMovieDetails(selectedMovieId);

      // Create FormData for submission
      const formData = new FormData();

      // Append images to FormData
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Append other fields to FormData
      formData.append('title', postTitle);
      formData.append('review', review);
      formData.append('rating', (rating ?? 0).toString());
      formData.append('commentsCount', '0');
      formData.append('movieId', movieDetails.id.toString());
      formData.append('movieName', movieDetails.title);
      formData.append(
        'moviePosterURL',
        `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`,
      );

      // Send post to backend
      await postService.createPost(formData);

      // Show success toast
      showSuccessToast('Post created successfully!');

      // Navigate to home page after successful submission
      navigate('/');
    } catch (error) {
      // Show error toast
      if (error instanceof Error) {
        showErrorToast(`Error creating post: ${error.message}`);
      } else {
        showErrorToast('An unknown error occurred while creating the post.');
      }
    }
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
            selected={selectedMovieId === movie.id}
            onSelect={handleMovieSelect}
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
              Post Title
            </Typography>
            <TextField
              fullWidth
              placeholder="Give your review a catchy title..."
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
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
          </FormSection>

          <FormSection>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="500">
              Your Rating
            </Typography>
            <RatingContainer>
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
            </RatingContainer>
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add up to 3 images to share your experience (optional)
            </Typography>

            {previewUrls.length < 3 && (
              <ImageUploadBox onClick={handleImageUploadClick}>
                <input
                  type="file"
                  id="image-upload-input"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <CloudUploadIcon
                  sx={{
                    fontSize: 40,
                    color: 'primary.main',
                    mb: 2,
                    opacity: 0.8,
                  }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Click to upload images
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({3 - previewUrls.length} remaining)
                </Typography>
              </ImageUploadBox>
            )}

            {previewUrls.length > 0 && (
              <ImagePreviewContainer>
                {previewUrls.map((url, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '133%', // 4:3 aspect ratio
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <ImagePreview
                      src={url}
                      alt={`Preview ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
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
              </ImagePreviewContainer>
            )}
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
