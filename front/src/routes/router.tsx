import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import MainLayout from 'layouts/main-layout';
import HomePage from 'pages/HomePage/HomePage';
import Signin from 'pages/AuthenticationPages/Signin';
import Signup from 'pages/AuthenticationPages/Signup';
import AddPost from 'pages/PostsPages/AddPostPage/AddPost';
import MyProfile from 'pages/userPages/MyProfilePage/MyProfile';
import App from 'App';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <MainLayout>
            <Outlet />
          </MainLayout>
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
            path: '/users/myprofile',
            element: <MyProfile />,
          },
        ],
      },
      {
        path: '/auth/signin',
        element: <Signin />,
      },
      {
        path: '/auth/signup',
        element: <Signup />,
      },
    ],
  },
];

export default createBrowserRouter(routes);
