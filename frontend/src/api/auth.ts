import { apiClient } from './client';
import type { User } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const registerRequest = (data: { name: string; email: string; password: string }) =>
  apiClient.post<AuthResponse>('/auth/register', data).then((res) => res.data);

export const loginRequest = (data: { email: string; password: string }) =>
  apiClient.post<AuthResponse>('/auth/login', data).then((res) => res.data);

export const refreshRequest = () =>
  apiClient.post<AuthResponse>('/auth/refresh').then((res) => res.data);

export const logoutRequest = () => apiClient.post('/auth/logout');
