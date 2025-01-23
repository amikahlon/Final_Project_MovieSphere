import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const drawerWidth = 300;
const collapsedWidth = 65;

const Sidebar = ({
  mobileOpen,
  setMobileOpen,
  setIsClosing,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) => {
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: isCollapsed ? collapsedWidth : drawerWidth },
        flexShrink: { lg: 0 },
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        <DrawerItems isCollapsed={false} onToggleCollapse={() => {}} />
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? collapsedWidth : drawerWidth,
            transition: 'width 0.3s',
          },
        }}
        open
      >
        <DrawerItems
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
