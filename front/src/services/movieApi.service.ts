import axios from 'axios';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

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
