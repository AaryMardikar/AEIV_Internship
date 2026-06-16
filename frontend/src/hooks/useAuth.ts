import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, RegisterCredentials } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ─── Current User ─────────────────────────────────────────────────────────────
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const useLogin = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const useRegister = () => {
  const { register } = useAuth();
  return useMutation({
    mutationFn: (data: RegisterCredentials) => register(data),
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.clear(),
  });
};
