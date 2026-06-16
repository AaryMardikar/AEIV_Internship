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
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Fade,
  LinearProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, FieldError } from '@/types';

// ─── Password Strength ────────────────────────────────────────────────────────
const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: 'Very weak', color: '#A4262C' },
    { label: 'Weak', color: '#D83B01' },
    { label: 'Fair', color: '#F7630C' },
    { label: 'Good', color: '#107C10' },
    { label: 'Strong', color: '#107C10' },
  ];
  return { score, ...(levels[Math.max(0, score - 1)] ?? levels[0]) };
};

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'Legal', 'IT', 'Other',
];

const ROLE_LABELS: Record<UserRole, { label: string; desc: string }> = {
  employee: { label: 'Employee', desc: 'Standard user access' },
  manager: { label: 'Manager', desc: 'Team and project management' },
  admin: { label: 'Admin', desc: 'Full system access' },
};

// ─── Validation ───────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: string;
}

const validateStep1 = (f: FormData): FieldError => {
  const e: FieldError = {};
  if (!f.name.trim()) e.name = 'Full name is required.';
  else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
  if (!f.email.trim()) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
  return e;
};

const validateStep2 = (f: FormData): FieldError => {
  const e: FieldError = {};
  if (!f.password) e.password = 'Password is required.';
  else if (f.password.length < 8) e.password = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(f.password)) e.password = 'Add at least one uppercase letter.';
  else if (!/[a-z]/.test(f.password)) e.password = 'Add at least one lowercase letter.';
  else if (!/[0-9]/.test(f.password)) e.password = 'Add at least one number.';
  if (!f.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
};

// ─── Register Page ────────────────────────────────────────────────────────────
const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'employee', department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');

  const { isAuthenticated } = useAuth();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) {
      const errs = step === 0 ? validateStep1({ ...form, [field]: val }) : validateStep2({ ...form, [field]: val });
      setFieldErrors((prev) => ({ ...prev, [field]: errs[field] || '' }));
    }
  };

  const blur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = step === 0 ? validateStep1(form) : validateStep2(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] || '' }));
  };

  const goNext = () => {
    setTouched({ name: true, email: true });
    const errs = validateStep1(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setTouched({ password: true, confirmPassword: true });
    const errs = validateStep2(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    register(
      {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        department: form.department || undefined,
      },
      {
        onSuccess: () => navigate('/dashboard', { replace: true }),
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string; errors?: { field: string; message: string }[] } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors?.length) {
            const mapped: FieldError = {};
            apiErrors.forEach(({ field, message }) => (mapped[field] = message));
            setFieldErrors(mapped);
            // If email error, go back to step 1
            if (mapped.email || mapped.name) setStep(0);
          } else {
            setServerError(axiosErr?.response?.data?.message || 'Registration failed. Please try again.');
          }
        },
      }
    );
  };

  const pwStrength = getPasswordStrength(form.password);
  const err = (f: string) => touched[f] && !!fieldErrors[f];
  const helperText = (f: string) => (touched[f] && fieldErrors[f]) || '';

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ backgroundColor: 'background.default', py: 4, px: 2 }}>

      <Box width="100%" maxWidth={520}>
        {/* Brand Header */}
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={3}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #0078D4, #6264A7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BusinessIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>Outlook Workflow Hub</Typography>
            <Typography variant="caption" color="text.secondary">Enterprise Productivity Platform</Typography>
          </Box>
        </Stack>

        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 }, borderRadius: 3,
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>Create your account</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Join your organisation's workspace.
          </Typography>

          {/* Step Indicator */}
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {['Account Info', 'Security & Role'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Server Error */}
          <Fade in={!!serverError}>
            <Box mb={serverError ? 2 : 0}>
              {serverError && (
                <Alert severity="error" onClose={() => setServerError('')} sx={{ borderRadius: 2 }}>
                  {serverError}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* ── Step 0: Account Info ──────────────────────────────────── */}
          {step === 0 && (
            <Fade in>
              <Stack spacing={2.5}>
                <TextField
                  id="reg-name"
                  label="Full name"
                  fullWidth required
                  value={form.name}
                  onChange={set('name')}
                  onBlur={() => blur('name')}
                  error={err('name')}
                  helperText={helperText('name')}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color={err('name') ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  id="reg-email"
                  label="Work email"
                  type="email"
                  fullWidth required
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() => blur('email')}
                  error={err('email')}
                  helperText={helperText('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color={err('email') ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Role Selection */}
                <FormControl fullWidth>
                  <InputLabel id="reg-role-label">Role</InputLabel>
                  <Select
                    labelId="reg-role-label"
                    id="reg-role"
                    value={form.role}
                    label="Role"
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                  >
                    {(Object.entries(ROLE_LABELS) as [UserRole, { label: string; desc: string }][]).map(
                      ([value, { label, desc }]) => (
                        <MenuItem key={value} value={value}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{label}</Typography>
                            <Typography variant="caption" color="text.secondary">{desc}</Typography>
                          </Box>
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>

                {/* Department */}
                <FormControl fullWidth>
                  <InputLabel id="reg-dept-label">Department (optional)</InputLabel>
                  <Select
                    labelId="reg-dept-label"
                    id="reg-department"
                    value={form.department}
                    label="Department (optional)"
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    startAdornment={
                      <InputAdornment position="start">
                        <WorkIcon fontSize="small" color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=""><em>Select department</em></MenuItem>
                    {DEPARTMENTS.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  id="reg-next-btn"
                  variant="contained"
                  fullWidth size="large"
                  onClick={goNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5, fontWeight: 700, borderRadius: 2,
                    background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #005A9E 0%, #464775 100%)' },
                  }}
                >
                  Continue
                </Button>
              </Stack>
            </Fade>
          )}

          {/* ── Step 1: Password & Submit ─────────────────────────────── */}
          {step === 1 && (
            <Fade in>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  {/* Review summary */}
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    backgroundColor: 'action.hover',
                    border: '1px solid', borderColor: 'divider',
                  }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      <Chip icon={<PersonIcon />} label={form.name} size="small" variant="outlined" />
                      <Chip icon={<EmailIcon />} label={form.email} size="small" variant="outlined" />
                      <Chip icon={<BadgeIcon />} label={ROLE_LABELS[form.role].label} size="small" color="primary" />
                      {form.department && (
                        <Chip icon={<WorkIcon />} label={form.department} size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>

                  {/* Password */}
                  <Box>
                    <TextField
                      id="reg-password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth required
                      value={form.password}
                      onChange={set('password')}
                      onBlur={() => blur('password')}
                      error={err('password')}
                      helperText={helperText('password')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" color={err('password') ? 'error' : 'action'} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((s) => !s)} size="small" tabIndex={-1}>
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Password strength meter */}
                    {form.password && (
                      <Box mt={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(pwStrength.score / 5) * 100}
                          sx={{
                            borderRadius: 4,
                            height: 5,
                            backgroundColor: 'action.selected',
                            '& .MuiLinearProgress-bar': { backgroundColor: pwStrength.color, borderRadius: 4 },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: pwStrength.color, fontWeight: 600 }}>
                          {pwStrength.label}
                        </Typography>

                        {/* Requirements checklist */}
                        <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                          {PASSWORD_RULES.map((rule) => (
                            <Chip
                              key={rule.label}
                              icon={<CheckCircleIcon />}
                              label={rule.label}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                backgroundColor: rule.test(form.password) ? '#107C1018' : 'action.hover',
                                color: rule.test(form.password) ? '#107C10' : 'text.secondary',
                                '& .MuiChip-icon': {
                                  color: rule.test(form.password) ? '#107C10' : 'action.disabled',
                                  fontSize: '0.85rem',
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* Confirm Password */}
                  <TextField
                    id="reg-confirm-password"
                    label="Confirm password"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth required
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    onBlur={() => blur('confirmPassword')}
                    error={err('confirmPassword')}
                    helperText={
                      touched.confirmPassword && form.confirmPassword && form.password === form.confirmPassword
                        ? '✓ Passwords match'
                        : helperText('confirmPassword')
                    }
                    FormHelperTextProps={{
                      sx: {
                        color:
                          touched.confirmPassword && form.confirmPassword && form.password === form.confirmPassword
                            ? '#107C10'
                            : undefined,
                        fontWeight:
                          touched.confirmPassword && form.password === form.confirmPassword ? 600 : 400,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color={err('confirmPassword') ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm((s) => !s)} size="small" tabIndex={-1}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Actions */}
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      onClick={() => setStep(0)}
                      startIcon={<ArrowBackIcon />}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      Back
                    </Button>
                    <Button
                      id="reg-submit-btn"
                      type="submit"
                      variant="contained"
                      fullWidth size="large"
                      disabled={isPending}
                      endIcon={!isPending && <ArrowForwardIcon />}
                      sx={{
                        py: 1.5, fontWeight: 700, borderRadius: 2,
                        background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #005A9E 0%, #464775 100%)' },
                      }}
                    >
                      {isPending ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Fade>
          )}
        </Paper>

        {/* Sign-in link */}
        <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
          Already have an account?{' '}
          <RouterLink to="/login" style={{ color: '#0078D4', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
