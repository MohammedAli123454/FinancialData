// ----------------------
// 2. /app/hooks/useCurrentUser.ts
// ----------------------
'use client';
import useSWR from 'swr';

export type User = { id: number; username: string; role: string } | null;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<User>('/api/auth/me', fetcher);
  return {
    user: data,
    isLoading,
    isLoggedIn: !!data && !error,
    mutate,
  };
}