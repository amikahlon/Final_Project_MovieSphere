import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import userService from './services/auth.service';
import { useDispatch } from 'react-redux';

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [tokenUpdated, setTokenUpdated] = useState(false);

  useEffect(() => {
    // This runs on every route change to check token status,
    // but only refreshes the token if it's actually invalid
    userService.checkAndLogTokenStatus(dispatch);
    // The refresh happens inside checkAndLogTokenStatus only when needed
  }, [location, dispatch]);

  useEffect(() => {
    const handleTokenUpdate = () => {
      setTokenUpdated(true);
    };

    window.addEventListener('tokenUpdated', handleTokenUpdate);

    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, []);

  return <Outlet key={location.pathname + (tokenUpdated ? 'updated' : '')} />;
};

export default App;
