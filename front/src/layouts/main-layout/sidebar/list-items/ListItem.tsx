import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

interface ListItemProps {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isCollapsed?: boolean;
}

const ListItem = ({ label, path, icon, isCollapsed }: ListItemProps) => {
  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 2.5,
        borderRadius: 1,
        minHeight: 48,
        justifyContent: isCollapsed ? 'center' : 'initial',
        '&:hover': {
          bgcolor: 'grey.100',
        },
      }}
    >
      {icon && <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 48 }}>{icon}</ListItemIcon>}
      {!isCollapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );
};

export default ListItem;
