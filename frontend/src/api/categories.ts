import { apiClient } from './client';
import type { Category } from '../types';

export const fetchCategories = () =>
  apiClient.get<Category[]>('/categories').then((res) => res.data);

export const createCategory = (data: { name: string; color?: string }) =>
  apiClient.post<Category>('/categories', data).then((res) => res.data);

export const updateCategory = (id: string, data: { name?: string; color?: string }) =>
  apiClient.put<Category>(`/categories/${id}`, data).then((res) => res.data);

export const deleteCategory = (id: string) => apiClient.delete(`/categories/${id}`);
