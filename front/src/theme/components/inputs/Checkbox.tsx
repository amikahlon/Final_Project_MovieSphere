import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Checkbox: Components<Omit<Theme, 'components'>>['MuiCheckbox'] = {
  defaultProps: {

  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.info.dark,
    }),
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(0.75),
      '& .MuiBox-root': {
        fontSize: theme.typography.h5.fontSize,
      },
    }),
    sizeSmall: ({ theme }) => ({
      '& .MuiBox-root': {
        fontSize: theme.typography.h6.fontSize,
      },
    }),
  },
};

export default Checkbox;