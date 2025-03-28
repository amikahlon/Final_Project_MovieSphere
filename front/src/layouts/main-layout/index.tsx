import { useState, useEffect, PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Sidebar from 'layouts/main-layout/sidebar';
import Topbar from 'layouts/main-layout/topbar';

const drawerWidth = 240; // רוחב Sidebar מותאם

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load initial state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        setIsClosing={setIsClosing}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', lg: `calc(100% - ${drawerWidth}px)` },

          position: 'relative',
        }}
      >
        <Box sx={{ margin: 0, padding: 0, flex: 1 }}>
          {/* Topbar */}
          <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              margin: 0,
              padding: { xs: '16px', lg: '24px' }, // ריווח דינמי לפי גודל המסך
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
