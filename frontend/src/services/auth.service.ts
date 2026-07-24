import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@server/src/modules/auth/auth.schemas';
import { apiGet, apiPost, apiPostNoContent } from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiPost<AuthUser>('/auth/login', credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => apiGet<AuthUser>('/auth/me'),
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPostNoContent('/auth/logout'),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}
