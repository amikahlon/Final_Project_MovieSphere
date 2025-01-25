import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Grid,
    Dialog,
    DialogContent,
    DialogTitle,
    CircularProgress,
} from '@mui/material';
import {
    Star as StarIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import movieService from 'services/movieApi.service';

export const MovieDetailDialog = ({
    open,
    onClose,
    movieId,
}: {
    open: boolean;
    onClose: () => void;
    movieId: number;
}) => {
    const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await movieService.getMovieDetails(movieId);
                setMovieDetails(data);
            } catch (err) {
                setError('Failed to fetch movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [open, movieId]);

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? 'Loading...' : movieDetails?.title || 'Movie Details'}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="h6">
                        {error}
                    </Typography>
                ) : movieDetails ? (
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <img
                                src={
                                    movieDetails.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                                        : '/placeholder.png'
                                }
                                alt={movieDetails.title}
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
                                    Overview
                                </Typography>
                                <Typography>{movieDetails.overview}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ color: 'gold', mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    {movieDetails.vote_average}/10
                                </Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Release Date:
                                </Typography>
                                <Typography>{movieDetails.release_date}</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Runtime:
                                </Typography>
                                <Typography>{movieDetails.runtime} minutes</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Genres:
                                </Typography>
                                <Typography>
                                    {movieDetails.genres.map((genre) => genre.name).join(', ')}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
