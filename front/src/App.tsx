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
    const checkToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || userService.isTokenExpiringSoon(accessToken)) {
        await userService.checkAndLogTokenStatus(dispatch);
      }
    };
    checkToken();
  }, [location, dispatch]);

  useEffect(() => {
    const handleTokenUpdate = () => {
      setTokenUpdated((prev) => !prev);
    };
    window.addEventListener('tokenUpdated', handleTokenUpdate);
    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, []);

  return <Outlet key={location.pathname + (tokenUpdated ? 'updated' : '')} />;
};

export default App;
