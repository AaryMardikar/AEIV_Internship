import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { ReportProblem as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ backgroundColor: 'background.default', p: 3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              maxWidth: 550,
              width: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'error.lighter',
                color: 'error.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ErrorIcon sx={{ fontSize: 35, color: '#A4262C' }} />
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              An unexpected error occurred while rendering this page. The system administrator has been notified.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  p: 2,
                  mb: 4,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxHeight: 150,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  color="error"
                  component="pre"
                  sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', m: 0 }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #005A9E 0%, #464775 100%)' },
                }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ fontWeight: 600 }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
