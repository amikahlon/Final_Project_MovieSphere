import axios from 'axios';
import axiosInstance from './axios.service';

const CHATGPT_API_URL = '/chatgpt';

interface RecommendedMovie {
  id?: number;
  title: string;
  poster_path?: string | null;
  reason: string;
}

// Fetch recommended movies based on selected movies
const getRecommendations = async (movieTitles: string[]): Promise<RecommendedMovie[]> => {
  try {
    const response = await axiosInstance.post(`${CHATGPT_API_URL}/recommendations`, {
      movieTitles,
    });
    return response.data.recommendations.map((movie: RecommendedMovie) => ({
      id: movie.id || null,
      title: movie.title,
      poster_path: movie.poster_path || null,
      reason: movie.reason,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch recommendations';
      throw new Error(message);
    }
    throw new Error('An unknown error occurred');
  }
};

const chatgptService = {
  getRecommendations,
};

export default chatgptService;
