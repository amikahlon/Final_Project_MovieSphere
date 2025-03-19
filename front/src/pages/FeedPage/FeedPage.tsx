import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Slider,
  Button,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
  Grid,
} from '@mui/material';
import PostDetails from 'components/PostDetails';
import postService from 'services/post.service';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import StarIcon from '@mui/icons-material/Star';

// Memoized version of PostDetails to avoid unnecessary rerenders
const MemoizedPostDetails = React.memo(PostDetails);

const marks = [
  { value: 0, label: '0' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 6, label: '6' },
  { value: 8, label: '8' },
  { value: 10, label: '10' },
];

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<string[]>([]);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 5; // Number of posts to load per batch

  // Rating filter state
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 10]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Clear posts when filter changes
  useEffect(() => {
    if (filterApplied) {
      setPosts([]);
      setPage(0);
      setHasMore(true);
    }
  }, [filterApplied]);

  // Fetch posts based on page with optional rating filter
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setNoResults(false);

      const startIndex = page * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE - 1;

      let response;

      // Use the appropriate service method based on whether filter is applied
      if (filterApplied) {
        response = await postService.getPostsByRatingRange(
          ratingRange[0],
          ratingRange[1],
          startIndex,
          endIndex,
        );
      } else {
        response = await postService.getPostsInRange(startIndex, endIndex);
      }

      const { posts: newPosts, totalPosts } = response;

      // Check if we have zero posts with filter applied
      if (filterApplied && page === 0 && newPosts.length === 0) {
        setNoResults(true);
      }

      // Update posts - prevent duplicates by using a Set
      setPosts((prevPosts) => {
        // Create a Set of existing post IDs for O(1) lookup
        const existingPostIds = new Set(prevPosts);

        // Filter out any duplicates from the new posts
        const uniqueNewPosts = newPosts
          .map((post) => post._id)
          .filter((postId) => !existingPostIds.has(postId));

        // Only add unique posts
        return [...prevPosts, ...uniqueNewPosts];
      });

      setTotalPosts(totalPosts);

      // Check if we have more posts to load - adjust logic to account for duplicates
      if (newPosts.length < PAGE_SIZE || startIndex + newPosts.length >= totalPosts) {
        setHasMore(false);
      } else {
        setPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [page, ratingRange, filterApplied, loading, hasMore]);

  // Infinite scrolling with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          fetchPosts();
        }
      },
      { threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchPosts, hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle rating slider change
  const handleRatingChange = (_event: Event, newValue: number | number[]) => {
    setRatingRange(newValue as [number, number]);
    setActiveFilter(true);
  };

  // Apply filter
  const applyFilter = () => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setFilterApplied(true);
    fetchPosts();
  };

  // Reset filter
  const resetFilter = () => {
    window.location.reload();
  };

  return (
    <>
      <Container maxWidth="lg">
        {' '}
        {/* Changed from md to lg to match MyReviews */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {' '}
          {/* Reduced margin bottom */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              borderRadius: '12px',
              padding: '12px', // Reduced padding
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
            }}
          >
            <RateReviewIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main', opacity: 0.9 }} />{' '}
            {/* Smaller icon */}
            <Typography variant="h4" fontWeight="500" color="text.primary">
              All Reviews
            </Typography>
          </Box>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '10px',
              background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
              transition: 'all 0.3s ease',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <Stack spacing={2}>
              {' '}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterAltIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />{' '}
                <Typography variant="subtitle1" fontWeight="500">
                  {' '}
                  Filter by Rating
                </Typography>
              </Box>
              <Box sx={{ px: 1, width: '100%' }}>
                {' '}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  {' '}
                  <StarIcon sx={{ color: 'gold', mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2" fontWeight="500">
                    {' '}
                    Rating Range: {ratingRange[0]} - {ratingRange[1]}
                  </Typography>
                </Box>
                <Tooltip title="Select your preferred rating range" arrow>
                  <Slider
                    value={ratingRange}
                    onChange={handleRatingChange}
                    valueLabelDisplay="auto"
                    marks={marks}
                    min={0}
                    max={10}
                    step={1}
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                        backgroundColor: '#fff',
                        border: '2px solid currentColor',
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 6px rgba(63, 81, 181, 0.16)',
                        },
                      },
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                </Tooltip>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center">
                {' '}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!activeFilter}
                  onClick={applyFilter}
                  size="small"
                  sx={{
                    px: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(50, 50, 93, 0.11)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(50, 50, 93, 0.1)',
                    },
                  }}
                >
                  Apply Filter
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetFilter}
                  disabled={!filterApplied}
                  size="small"
                  sx={{
                    px: 2,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Paper>
          {filterApplied && (
            <Paper
              sx={{
                p: 1,
                mb: 2,
                backgroundColor: 'primary.light',
                color: 'white',
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2">
                Showing posts with ratings between {ratingRange[0]} and {ratingRange[1]}
                {totalPosts !== null && ` (${totalPosts} posts found)`}
              </Typography>
            </Paper>
          )}
        </Box>
        {filterApplied && noResults && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              mt: 2,
              borderRadius: '12px',
              backgroundColor: 'info.light',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6">
              No posts found with ratings between {ratingRange[0]} and {ratingRange[1]}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Try adjusting your filter criteria or reset the filter to see all posts.
            </Typography>
          </Paper>
        )}
      </Container>

      <Container maxWidth="lg">
        {' '}
        {loading && posts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : noResults ? null : (
          <>
            <Grid container spacing={4}>
              {' '}
              {posts.map((postId, index) => (
                <Grid item xs={12} key={`post-${postId}-${index}`}>
                  <Box position="relative">
                    <MemoizedPostDetails postId={postId} />
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box
              ref={loaderRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 4,
                visibility: hasMore ? 'visible' : 'hidden',
              }}
            >
              {loading && <CircularProgress size={30} />}
            </Box>

            {/* End of list message */}
            {!hasMore && posts.length > 0 && (
              <Box sx={{ textAlign: 'center', py: 3, mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    display: 'inline-block',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: 2,
                  }}
                ></Paper>
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Feed;
