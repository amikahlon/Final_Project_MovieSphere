import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../store/slices/userSlice';
import paths from '../../routes/paths';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Route accessible only to authenticated users
export const AuthenticatedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={paths.signin} replace />;
  }

  return <>{children}</>;
};

// Route accessible only to unauthenticated users (signin/signup)
export const UnauthenticatedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();

  if (isLoggedIn) {
    // If user was redirected from another page, send them back there
    // Otherwise go to home page
    const from = location.state?.from?.pathname || paths.root;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
