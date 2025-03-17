// Types for API responses
// Updated Types for API responses
interface Genre {
  id: number;
  name: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genres: Genre[];
  runtime: number;
  vote_average: number;
  vote_count: number;
  spoken_languages: SpokenLanguage[];
  production_countries: ProductionCountry[];
}

interface SearchMoviesResponse {
  results: Movie[];
}

interface GetMovieDetailsResponse extends Movie {}

interface SearchMoviesResponse {
  results: Movie[];
}

interface GetPopularMoviesResponse {
  results: Movie[];
  total_pages: number;
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
