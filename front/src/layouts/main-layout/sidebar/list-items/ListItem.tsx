import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

interface ListItemProps {
  label: string;
  path: string;
}

const ListItem = ({ label, path }: ListItemProps) => {
  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 2.5,
        '&:hover': {
          bgcolor: 'primary.light',
        },
      }}
    >
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

export default ListItem;
