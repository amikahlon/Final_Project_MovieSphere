import React from 'react';
import { Typography, Card, CardMedia, CardContent, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

interface MovieCardProps {
  id: number;
  imageUrl: string;
  title: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  width: 180, // Reduced width
  height: 360, // Adjusted height
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.99)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  border: 'none',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
    '& .movie-overlay': {
      opacity: 1,
    },
    '& .movie-content': {
      background: 'rgba(255, 255, 255, 0.99)',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    },
    '& .movie-title': {
      color: theme.palette.primary.main,
    },
  },
}));

const MovieOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '20px',
  color: 'white',
});

const EmptyPoster = styled(Box)(({ theme }) => ({
  height: '260px', // Reduced height
  background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[300]} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.grey[500],
}));

const MovieCard: React.FC<MovieCardProps> = ({ id, imageUrl, title }) => {
  const handleClick = () => {
    alert(`Movie ID: ${id}\nTitle: ${title}`);
  };

  return (
    <StyledCard onClick={handleClick}>
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={title}
          sx={{
            height: 260, // Reduced height
            objectFit: 'cover',
          }}
        />
      ) : (
        <EmptyPoster>
          <LocalMoviesIcon sx={{ fontSize: 50 }} />
        </EmptyPoster>
      )}
      <MovieOverlay className="movie-overlay">
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: '0.9rem',
            letterSpacing: '0.2px',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          Click to select
        </Typography>
      </MovieOverlay>
      <CardContent
        className="movie-content"
        sx={{
          transition: 'all 0.3s ease',
          padding: '16px',
          background: 'white',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          className="movie-title"
          variant="subtitle1"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.5',
            fontSize: '0.95rem',
            fontWeight: 500,
            textAlign: 'center',
            transition: 'color 0.3s ease',
            color: (theme) => theme.palette.text.primary,
            margin: 0,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default MovieCard;
