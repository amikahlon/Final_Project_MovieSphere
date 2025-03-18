import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  username: string;
  email: string;
  isLoggedIn: boolean;
  profilePicture: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  favoriteGenres: string[];
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        username: string;
        email: string;
        role: string;
        profilePicture: string;
        accessToken: string;
        refreshToken: string;
        favoriteGenres: string[];
      }>,
    ) => {
      state.user = {
        ...action.payload,
        isLoggedIn: true,
        favoriteGenres: action.payload.favoriteGenres || [],
      };
      console.log('User state after signIn:', state.user);
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.accessToken = action.payload;
        console.log('Updated accessToken:', state.user.accessToken);
      }
    },
    updateRefreshToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.refreshToken = action.payload;
        console.log('Updated refreshToken:', state.user.refreshToken);
      }
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      if (state.user) {
        state.user.accessToken = action.payload.accessToken;
        state.user.refreshToken = action.payload.refreshToken;
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateFavoriteGenres: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.favoriteGenres = action.payload;
        console.log('Updated favorite genres:', state.user.favoriteGenres);
      }
    },
    updateUsername: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.username = action.payload;
        console.log('Updated username in Redux:', action.payload);
      }
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePicture = action.payload;
        console.log('Updated profile picture in Redux:', action.payload);
      }
    },
  },
});

export const {
  signIn,
  updateAccessToken,
  updateRefreshToken,
  updateTokens,
  clearUser,
  updateFavoriteGenres,
  updateUsername,
  updateProfilePicture,
} = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsLoggedIn = (state: { user: UserState }) => !!state.user.user?.isLoggedIn;
export const selectIsAdmin = (state: { user: UserState }) => state.user.user?.role === 'admin';
export const selectTokens = (state: { user: UserState }) => ({
  accessToken: state.user.user?.accessToken,
  refreshToken: state.user.user?.refreshToken,
});
export const selectFavoriteGenres = (state: { user: UserState }) =>
  state.user.user?.favoriteGenres || [];

export default userSlice.reducer;
