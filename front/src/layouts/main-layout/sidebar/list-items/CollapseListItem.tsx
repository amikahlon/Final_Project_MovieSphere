import { useState } from 'react';
import { MenuItem } from 'routes/sitemap';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

const CollapseListItem = ({ subheader, active, items/*, icon*/ }: MenuItem) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ pb: 1.5 }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
xx
        </ListItemIcon>
        <ListItemText
          primary={subheader}
          sx={{
            '& .MuiListItemText-primary': {
              color: active ? 'text.primary' : null,
            },
          }}
        />
        cc
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items?.map((route) => {
            return (
              <ListItemButton
                key={route.pathName}
                component={Link}
                href={route.path}
                sx={{ ml: 2.25, bgcolor: route.active ? 'info.main' : null }}
              >
                <ListItemText
                  primary={route.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'text.primary',
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
};

export default CollapseListItem;
