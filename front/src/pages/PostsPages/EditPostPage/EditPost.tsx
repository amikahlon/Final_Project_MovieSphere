import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EditIcon from '@mui/icons-material/Edit';
import movieService from '../../../services/movieApi.service';
import postService from 'services/post.service';
import MovieCard from '../../../components/movies/MovieCard';
import { showErrorToast, showSuccessToast } from 'components/toastUtils';
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
} from '../AddPostPage/style';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

interface ExistingImage {
  url: string;
  isExisting: true;
  originalUrl: string;
}

interface NewImage {
  url: string;
  isExisting: false;
  file: File;
}

type ImageItem = ExistingImage | NewImage;

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const EditPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();

  // State variables for post data
  const [postTitle, setPostTitle] = useState<string>('');
  const [review, setReview] = useState<string>('');
  const [rating, setRating] = useState<number | null>(0);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [originalMovieId, setOriginalMovieId] = useState<number | null>(null);
  const [movieName, setMovieName] = useState<string>('');

  // State variables for search functionality
  const [movieQuery, setMovieQuery] = useState<string>('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchingPost, setFetchingPost] = useState<boolean>(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setFetchingPost(true);
        const post = await postService.getPostById(postId);

        // Set post data
        setPostTitle(post.title);
        setReview(post.review);
        setRating(post.rating);
        setOriginalMovieId(parseInt(post.movieId));
        setSelectedMovieId(parseInt(post.movieId));
        setMovieName(post.movieName);

        // Convert existing images to ImageItem format
        const existingImages: ImageItem[] = post.images.map((imageUrl) => {
          // Use the same image URL format as in PostDetails component
          const fullUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `${import.meta.env.VITE_BACKEND_URL}${imageUrl}`;

          return {
            url: fullUrl,
            isExisting: true,
            originalUrl: imageUrl,
          };
        });

        setImages(existingImages);
      } catch (error) {
        if (error instanceof Error) {
          showErrorToast(`Error loading post: ${error.message}`);
        } else {
          showErrorToast('An unknown error occurred while loading the post.');
        }
        navigate('/my-reviews');
      } finally {
        setFetchingPost(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  // Handle click on image upload area
  const handleImageUploadClick = () => {
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      showErrorToast('Maximum 3 images allowed');
      return;
    }

    const newImages: ImageItem[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
    event.target.value = '';
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];

    if (imageToRemove.isExisting) {
      // Mark existing images for deletion on the server
      setImagesToDelete((prev) => [...prev, (imageToRemove as ExistingImage).originalUrl]);
    } else {
      // Revoke object URL for new images
      URL.revokeObjectURL(imageToRemove.url);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle movie search
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
        showErrorToast(`Error searching for movies: ${error.message}`);
      } else {
        showErrorToast('An unknown error occurred while searching for movies.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle movie selection
  const handleMovieSelect = (id: number) => {
    setSelectedMovieId(id === selectedMovieId ? null : id);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedMovieId) {
      showErrorToast('Please select a movie before submitting your review.');
      return;
    }

    try {
      // Check if selected movie has changed
      const movieHasChanged = selectedMovieId !== originalMovieId;
      let movieDetails = null;

      if (movieHasChanged) {
        // Fetch new movie details if changed
        movieDetails = await movieService.getMovieDetails(selectedMovieId);
      }

      // Create FormData for submission
      const formData = new FormData();

      // Add new images to FormData
      images.forEach((image) => {
        if (!image.isExisting) {
          formData.append('images', (image as NewImage).file);
        }
      });

      // Create update data object
      interface UpdateData {
        title: string;
        review: string;
        rating: number;
        existingImages: string[];
        imagesToDelete: string[];
        movieId?: string;
        movieName?: string;
        moviePosterURL?: string;
      }

      const updateData: UpdateData = {
        title: postTitle,
        review,
        rating: rating ?? 0,
        existingImages: [],
        imagesToDelete: [],
      };

      // Add existing images to keep
      const existingImages = images
        .filter((img): img is ExistingImage => img.isExisting)
        .map((img) => img.originalUrl);

      updateData.existingImages = existingImages;
      updateData.imagesToDelete = imagesToDelete;

      // Add movie data if changed
      if (movieHasChanged && movieDetails) {
        updateData.movieId = movieDetails.id.toString();
        updateData.movieName = movieDetails.title;
        updateData.moviePosterURL = `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`;
      }

      // Append all update data
      formData.append('updateData', JSON.stringify(updateData));

      // Send update to backend
      await postService.updatePostWithImages(postId!, formData);

      // Show success notification
      showSuccessToast('Post updated successfully!');

      // Navigate back to my reviews
      navigate('/my-reviews');
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(`Error updating post: ${error.message}`);
      } else {
        showErrorToast('An unknown error occurred while updating the post.');
      }
    }
  };

  // Render movie grid for search results
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

  if (fetchingPost) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
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
            <EditIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main', opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="500" color="text.primary">
              Edit Review
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Update your review for {movieName}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormSection>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="500">
              Change Movie (Optional)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Type movie title to search..."
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
              Manage your images (up to 3 images)
            </Typography>

            {images.length < 3 && (
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
                  ({3 - images.length} remaining)
                </Typography>
              </ImageUploadBox>
            )}

            {images.length > 0 && (
              <ImagePreviewContainer>
                {images.map((image, index) => (
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
                      src={image.url}
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

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/my-reviews')}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Cancel
            </Button>
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
              Update Review
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default EditPost;
