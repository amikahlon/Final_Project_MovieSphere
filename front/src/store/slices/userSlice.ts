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
        // וודא שמערך הג'אנרים תמיד מוגדר
        favoriteGenres: action.payload.favoriteGenres || [],
      };
      // לוג לבדיקה
      console.log('User state after signIn:', state.user);
    },
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
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
  },
});

export const { signIn, updateTokens, clearUser, updateFavoriteGenres } = userSlice.actions;

// מחזירי מידע
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsLoggedIn = (state: { user: UserState }) => !!state.user.user?.isLoggedIn;
export const selectIsAdmin = (state: { user: UserState }) => state.user.user?.role === 'admin';
export const selectTokens = (state: { user: UserState }) => ({
  accessToken: state.user.user?.accessToken,
  refreshToken: state.user.user?.refreshToken,
});
// הוספת selector ספציפי לג'אנרים
export const selectFavoriteGenres = (state: { user: UserState }) =>
  state.user.user?.favoriteGenres || [];

export default userSlice.reducer;
