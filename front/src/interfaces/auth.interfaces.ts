export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture: string;
  role: string;
  favoriteGenres: string[];
}

export interface SignInResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
  details: string;
}
