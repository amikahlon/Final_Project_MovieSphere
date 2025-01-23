import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Animations
export const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const shineAnimation = keyframes`
  0% { background-position: -100% }
  100% { background-position: 200% }
`;

export const perfectScoreAnimation = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// Styled Components
export const ImagePreview = styled('img')`
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

export const FormSection = styled(Box)(({ theme }) => ({
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

export const MovieGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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

export const EmptyStateBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: 'rgba(0, 0, 0, 0.4)',
  textAlign: 'center',
});

export const RatingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

export const RatingIndicator = styled(Box)<{ value: number }>(({ value, theme }) => ({
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

  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
}));

export const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed rgba(0, 0, 0, 0.12)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: theme.palette.primary.main,
  },
}));

export const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: theme.spacing(2),
  width: '100%',
  marginTop: theme.spacing(3),
}));

export const EmptyRatingBox = styled(Box)(({ theme }) => ({
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

  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    width: '100%',
  },
}));
