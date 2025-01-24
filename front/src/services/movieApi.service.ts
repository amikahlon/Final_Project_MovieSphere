import axios from 'axios';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

if (!TMDB_ACCESS_TOKEN) {
  throw new Error('TMDB_ACCESS_TOKEN is not defined in environment variables');
}
// Updated API functions
const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await axios.get<SearchMoviesResponse>(`${TMDB_API_URL}/search/movie`, {
      params: { query },
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

const getMovieDetails = async (movieId: number): Promise<GetMovieDetailsResponse> => {
  try {
    const response = await axios.get<GetMovieDetailsResponse>(`${TMDB_API_URL}/movie/${movieId}`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch movie details');
    }
    throw new Error('Failed to fetch movie details');
  }
};

const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get<GetPopularMoviesResponse>(`${TMDB_API_URL}/movie/popular`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch popular movies');
    }
    throw new Error('Failed to fetch popular movies');
  }
};

const getTopRatedMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get<GetTopRatedMoviesResponse>(`${TMDB_API_URL}/movie/top_rated`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch top-rated movies');
    }
    throw new Error('Failed to fetch top-rated movies');
  }
};

const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await axios.get<GetMoviesByGenreResponse>(`${TMDB_API_URL}/discover/movie`, {
      params: { with_genres: genreId },
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch movies by genre');
    }
    throw new Error('Failed to fetch movies by genre');
  }
};

const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await axios.get<GetGenresResponse>(`${TMDB_API_URL}/genre/movie/list`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });
    return response.data.genres;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.status_message || 'Failed to fetch genres');
    }
    throw new Error('Failed to fetch genres');
  }
};

const movieService = {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  getMoviesByGenre,
  getGenres,
};

export default movieService;
