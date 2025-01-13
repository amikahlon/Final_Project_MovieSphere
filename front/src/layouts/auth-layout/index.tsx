import { PropsWithChildren } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack
      component="main"
      alignItems="center"
      justifyContent="center"
      width={1}
      minHeight="100vh"
    >
      {/* Background Image and Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: -1,
        }}
      >
        {/* Background Image */}
        <div
          style={{
            backgroundImage: `url('/LoginBG.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100%',
            width: '100%',
          }}
        ></div>
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black with 50% opacity
          }}
        ></div>
      </div>
      {/* Content */}
      <Paper sx={{ px: { xs: 2, sm: 3.5 }, py: 4, width: 1, maxWidth: 460 }}>{children}</Paper>
    </Stack>
  );
};

export default AuthLayout;
