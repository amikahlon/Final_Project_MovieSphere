import axios from 'axios';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTllMjBhZGMxZTQ5ZWJhNjBkZDNkNDk0YTkxMmFiYiIsIm5iZiI6MTczNTU2MDQ3Ni42NzI5OTk5LCJzdWIiOiI2NzcyOGQxYzBmMjQ4ZTg1MDgxMjg5YmEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jQl4MnKKTjhOS5qsNg0sAxxRj3RvN9IY2XqXJHZgozA';

if (!TMDB_ACCESS_TOKEN) {
  throw new Error('TMDB_ACCESS_TOKEN is not defined in environment variables');
}

const searchMovies = async (query: string): Promise<unknown> => {
  try {
    const response = await axios.get(`${TMDB_API_URL}/search/movie`, {
      params: {
        query,
      },
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch movies');
    }
    throw new Error('Failed to fetch movies');
  }
};

const movieService = {
  searchMovies,
};

export default movieService;
