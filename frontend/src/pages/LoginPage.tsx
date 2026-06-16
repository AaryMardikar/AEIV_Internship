import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Stack,
  Link,
  Fade,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { FieldError } from '@/types';

// ─── Field Validation ─────────────────────────────────────────────────────────
const validate = (email: string, password: string): FieldError => {
  const errs: FieldError = {};
  if (!email.trim()) errs.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
  if (!password) errs.password = 'Password is required.';
  return errs;
};

// ─── Login Page ───────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { isAuthenticated } = useAuth();
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate(email, password);
    setFieldErrors(errs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Touch all fields & validate
    setTouched({ email: true, password: true });
    const errs = validate(email, password);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    login(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: () => navigate(from, { replace: true }),
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string; errors?: { field: string; message: string }[] } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors?.length) {
            const mapped: FieldError = {};
            apiErrors.forEach(({ field, message }) => (mapped[field] = message));
            setFieldErrors(mapped);
          } else {
            setServerError(axiosErr?.response?.data?.message || 'Invalid email or password. Please try again.');
          }
        },
      }
    );
  };

  return (
    <Box minHeight="100vh" display="flex" sx={{ backgroundColor: 'background.default' }}>
      {/* ── Left: Brand Panel ──────────────────────────────────────────────── */}
      <Box
        flex={1}
        display={{ xs: 'none', lg: 'flex' }}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          background: 'linear-gradient(160deg, #003B6B 0%, #0078D4 45%, #6264A7 100%)',
          px: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        {[
          { size: 500, opacity: 0.04, top: -100, left: -100 },
          { size: 350, opacity: 0.06, bottom: -80, right: -80 },
          { size: 200, opacity: 0.08, top: '40%', right: 60 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: c.size,
              height: c.size,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: `rgba(255,255,255,${c.opacity})`,
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
            }}
          />
        ))}

        <Stack alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }} maxWidth={400}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <BusinessIcon sx={{ fontSize: 44, color: 'white' }} />
          </Box>

          <Box textAlign="center">
            <Typography variant="h3" fontWeight={800} color="white" lineHeight={1.1} gutterBottom>
              Outlook Workflow Hub
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)' }} fontWeight={400}>
              Enterprise Productivity Platform
            </Typography>
          </Box>

          <Divider sx={{ width: 48, borderColor: 'rgba(255,255,255,0.3)' }} />

          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}
            textAlign="center"
          >
            Streamline workflows, manage teams, and drive organisational productivity — all from one
            intelligent hub.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {['Role-Based Access', 'JWT Secured', 'Real-time Updates'].map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Right: Login Form ──────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: { xs: '100%', lg: '480px' },
          minHeight: '100vh',
          flexShrink: 0,
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <Box width="100%" maxWidth={400}>
          {/* Mobile brand header */}
          <Box
            display={{ xs: 'flex', lg: 'none' }}
            alignItems="center"
            gap={1.5}
            mb={4}
            justifyContent="center"
          >
            <BusinessIcon color="primary" sx={{ fontSize: 30 }} />
            <Typography variant="h6" fontWeight={800} color="primary">
              Workflow Hub
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.6}>
              Sign in to your account to continue.
            </Typography>

            {/* Server Error */}
            <Fade in={!!serverError}>
              <Box mb={serverError ? 2.5 : 0}>
                {serverError && (
                  <Alert
                    severity="error"
                    onClose={() => setServerError('')}
                    sx={{ borderRadius: 2 }}
                  >
                    {serverError}
                  </Alert>
                )}
              </Box>
            </Fade>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {/* Email */}
                <TextField
                  id="login-email"
                  label="Email address"
                  type="email"
                  fullWidth
                  required
                  size="medium"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) {
                      setFieldErrors(validate(e.target.value, password));
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && !!fieldErrors.email}
                  helperText={touched.email && fieldErrors.email}
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color={touched.email && fieldErrors.email ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password */}
                <TextField
                  id="login-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  size="medium"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setFieldErrors(validate(email, e.target.value));
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  error={touched.password && !!fieldErrors.password}
                  helperText={touched.password && fieldErrors.password}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color={touched.password && fieldErrors.password ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                          aria-label="toggle password visibility"
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Submit */}
                <Button
                  id="login-submit-btn"
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isPending}
                  endIcon={!isPending && <ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #005A9E 0%, #464775 100%)',
                    },
                  }}
                >
                  {isPending ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            {/* Register link */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                New to Workflow Hub?
              </Typography>
            </Divider>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Create an account
            </Button>

            {/* Demo credentials hint */}
            <Box
              mt={3}
              p={2}
              sx={{
                backgroundColor: 'action.hover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                Demo Admin Account
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Email: <strong>admin@owh.com</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Password: <strong>Admin@123</strong>
              </Typography>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={3}
          >
            Protected by enterprise-grade security.{' '}
            <Link href="#" underline="hover">
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
