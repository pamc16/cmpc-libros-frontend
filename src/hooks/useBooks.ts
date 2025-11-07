import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export function useBooks(params: Record<string, any>) {
  const key = ['books', params];
  const queryFn = async () => {
    const res = await api.get('/books', { params });
    return res.data; // { count, rows }
  };
  return useQuery({ queryKey: key, queryFn });
}
