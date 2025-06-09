import { Box, Grid2, Typography, Link as MuiLink } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1e1e1e',
        color: 'white',
        py: 6,
        px: { xs: 3, md: 10 },
        mt: 0,
      }}
    >
      <Grid2 container spacing={4}>
        <Grid2 item size={8} md={4}>
          <Typography variant="h6" gutterBottom>
            SparkMap
          </Typography>
          <Typography sx={{ color: '#aaa' }}>
            Reimagining thinking tools for the digital age.
          </Typography>
        </Grid2>

        <Grid2 item size={2} md={4}>
          <Typography variant="h6" gutterBottom>
            Explore
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <MuiLink href="#" color="inherit" underline="hover">
              Docs
            </MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">
              Features
            </MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">
              Roadmap
            </MuiLink>
          </Box>
        </Grid2>

        <Grid2 item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Connect
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <MuiLink href="#" color="inherit" underline="hover">
              Twitter
            </MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">
              GitHub
            </MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">
              Contact Us
            </MuiLink>
          </Box>
        </Grid2>
      </Grid2>

      <Typography
        variant="body2"
        sx={{ mt: 6, color: '#777', textAlign: 'center' }}
      >
        © {new Date().getFullYear()} SparkMap. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;
