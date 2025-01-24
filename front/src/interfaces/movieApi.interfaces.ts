// Types for API responses
interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
}

interface SearchMoviesResponse {
  results: Movie[];
}

interface GetMovieDetailsResponse extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
}

interface GetPopularMoviesResponse {
  results: Movie[];
}

interface GetTopRatedMoviesResponse {
  results: Movie[];
}

interface GetMoviesByGenreResponse {
  results: Movie[];
}

interface Genre {
  id: number;
  name: string;
}

interface GetGenresResponse {
  genres: Genre[];
}
