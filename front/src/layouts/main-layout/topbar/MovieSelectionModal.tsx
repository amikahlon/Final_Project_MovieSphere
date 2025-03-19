import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Pagination,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import movieService from '../../../services/movieApi.service';
import chatgptService from '../../../services/chatgpt.service';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  reason?: string;
}

interface MovieSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

const MovieSelectionModal = ({ open, onClose }: MovieSelectionModalProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<Movie[] | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Movie | null>(null);

  useEffect(() => {
    if (open) {
      fetchMovies();
    } else {
      resetState();
    }
  }, [open, page]);

  const resetState = () => {
    setMovies([]);
    setSelectedMovies([]);
    setSearchQuery('');
    setPage(1);
    setTotalPages(1);
    setRecommendations(null);
    setSelectedRecommendation(null);
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let results, total;
      if (searchQuery.trim()) {
        const response = await movieService.searchMovies(searchQuery);
        results = response;
        total = 1;
      } else {
        const response = await movieService.getPopularMovies(page);
        results = response.results;
        total = response.total_pages;
      }
      setMovies(results.map((movie) => ({ ...movie, poster_path: movie.poster_path || '' })));
      setTotalPages(total);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchMovies();
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovies((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie],
    );
  };

  const handleSubmit = async () => {
    if (selectedMovies.length === 0) return;
    setLoading(true);
    try {
      const movieTitles = selectedMovies.map((movie) => movie.title);
      const response = await chatgptService.getRecommendations(movieTitles);

      const enrichedRecommendations = await Promise.all(
        response.map(async (rec) => {
          const searchResults = await movieService.searchMovies(rec.title);
          return searchResults.length > 0
            ? { ...searchResults[0], reason: rec.reason }
            : { ...rec, poster_path: '', reason: rec.reason };
        }),
      );
      //@ts-ignore
      setRecommendations(enrichedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPoster = (posterPath: string | null) => {
    if (posterPath) {
      return (
        <CardMedia
          component="img"
          height="200"
          image={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt="Movie poster"
        />
      );
    }

    return (
      <Box
        sx={{
          height: 200,
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageNotSupportedIcon sx={{ fontSize: 60, color: '#9e9e9e' }} />
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {recommendations ? 'Recommended Movies' : 'Select Your Favorite Movies'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
        ) : recommendations ? (
          <>
            <Grid container spacing={2}>
              {recommendations.map((movie) => (
                <Grid item xs={6} sm={4} md={3} key={movie.id || movie.title}>
                  <Card
                    onClick={() => setSelectedRecommendation(movie)}
                    sx={{
                      cursor: 'pointer',
                      border:
                        selectedRecommendation?.id === movie.id ? '3px solid #6b8dd6' : 'none',
                    }}
                  >
                    {renderPoster(movie.poster_path)}
                    <CardContent>
                      <Typography variant="body2" align="center">
                        {movie.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {selectedRecommendation && (
              <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                {selectedRecommendation.reason}
              </Typography>
            )}
          </>
        ) : (
          <>
            <TextField
              fullWidth
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              {movies.map((movie) => (
                <Grid item xs={6} sm={4} md={3} key={movie.id}>
                  <Card
                    onClick={() => handleSelectMovie(movie)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedMovies.some((m) => m.id === movie.id)
                        ? '3px solid #6b8dd6'
                        : 'none',
                    }}
                  >
                    {renderPoster(movie.poster_path)}
                    <CardContent>
                      <Typography variant="body2" align="center">
                        {movie.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {recommendations ? (
          <Button onClick={onClose} color="primary" variant="contained">
            Close
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={selectedMovies.length === 0 || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Recommendations'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MovieSelectionModal;
