import { apiClient } from './client';

type User = { id: string; email: string };

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(email: string, password: string) {
  const { data } = await apiClient.post('/auth/register', { email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function logout(token: string) {
  await apiClient.post(
    '/auth/logout',
    null,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}
