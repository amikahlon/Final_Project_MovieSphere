import React from 'react';
import ReactDOM from 'react-dom/client';
import router from 'routes/router';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from 'theme/theme.ts';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { store } from './store/store'; // Adjust the import path as necessary

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId='200569685740-uqhpcs47tc2v8te0aofvinva2i50d09o.apps.googleusercontent.com'>
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </React.StrictMode>
    </GoogleOAuthProvider>
  </Provider>,
);
