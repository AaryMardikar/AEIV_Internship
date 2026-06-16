import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: 'background.default' }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: '6rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}
          >
            404
          </Typography>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'action.selected',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              my: 2,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
