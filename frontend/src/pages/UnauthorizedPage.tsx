import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            You don't have permission to view this page. Contact your administrator if you believe
            this is a mistake.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            {isAuthenticated && (
              <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;
