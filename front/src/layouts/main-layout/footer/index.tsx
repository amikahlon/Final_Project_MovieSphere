import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
  return (
    <Typography
      mt={0.5}
      px={1}
      py={3}
      color="text.secondary"
      variant="body2"
      sx={{ textAlign: { xs: 'center', md: 'right' } }}
      letterSpacing={0.5}
      fontWeight={500}
    >
      Made with ❤️ by{' '}
      <Link href="https://github.com/amikahlon" target="_blank" rel="noreferrer">
        {'Ami Kahlon'}
      </Link>{' '}
      And
      {' '}
      <Link href="https://github.com/GuyMishan" target="_blank" rel="noreferrer">
        {'Guy Mishan'}
      </Link>
    </Typography>
  );
};

export default Footer;
