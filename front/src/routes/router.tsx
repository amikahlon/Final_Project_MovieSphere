import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { Outlet, Navigate } from 'react-router-dom';
import MainLayout from 'layouts/main-layout';
import HomePage from 'pages/HomePage/HomePage';
import Signin from 'pages/AuthenticationPages/Signin';
import Signup from 'pages/AuthenticationPages/Signup';
import AddPost from 'pages/PostsPages/AddPostPage/AddPost';
import EditPost from 'pages/PostsPages/EditPostPage/EditPost'; // Import EditPost component
import MyProfile from 'pages/userPages/MyProfilePage/MyProfile';
import PostDetails from 'pages/PostsPages/PostDetailsPage/PostDetails';
import MyReviews from 'pages/MyReviews/MyReviews';
import App from 'App';
import Feed from 'pages/FeedPage/FeedPage';
import {
  AuthenticatedRoute,
  UnauthenticatedRoute,
} from 'components/protected-routes/ProtectedRoutes';
import paths from './paths';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <AuthenticatedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </AuthenticatedRoute>
        ),
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: '/posts/addpost',
            element: <AddPost />,
          },
          {
            path: '/posts/:postId',
            element: <PostDetails />,
          },
          {
            path: '/edit-post/:postId', // Add the edit post route
            element: <EditPost />,
          },
          {
            path: '/feed',
            element: <Feed />,
          },
          {
            path: '/users/myprofile',
            element: <MyProfile />,
          },
          {
            path: '/MyReviews',
            element: <MyReviews />,
          },
        ],
      },
      {
        path: '/auth/signin',
        element: (
          <UnauthenticatedRoute>
            <Signin />
          </UnauthenticatedRoute>
        ),
      },
      {
        path: '/auth/signup',
        element: (
          <UnauthenticatedRoute>
            <Signup />
          </UnauthenticatedRoute>
        ),
      },
      // Redirect any unknown route to signin if not logged in
      {
        path: '*',
        element: <Navigate to={paths.signin} replace />,
      },
    ],
  },
];

export default createBrowserRouter(routes);
