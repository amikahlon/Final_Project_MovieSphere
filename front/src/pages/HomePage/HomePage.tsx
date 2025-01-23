import { motion } from 'framer-motion';
import { Paper, Typography, Container, Box } from '@mui/material';
import MovieGlobe from 'components/movies/MovieGlobe';

const HomePage = () => {
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1,
              textAlign: 'center',
              background: 'transparent',
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to MovieSphere
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Discover, Share and Experience Movies with Friends
            </Typography>
          </Paper>
        </motion.div>

        <Box
          sx={{
            position: 'relative',
            height: '500px',
            width: '100%',
          }}
        >
          <MovieGlobe />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Popular Reviews
            </Typography>
            {/* ********************************** */}
            {/* Add your reviews component here */}
            {/* ********************************** */}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Top Reviewers
            </Typography>
            {/* ********************************** */}
            {/* Add your top reviewers component here */}
            {/* ********************************** */}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
