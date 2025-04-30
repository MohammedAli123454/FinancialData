// app/hooks/useCurrentUser.ts
'use client';
import useSWR from 'swr';

export type User = { id: number; username: string; role: string } | null;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch user');
    throw error;
  }
  return res.json();
};

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<User>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  
  return {
    user: data,
    isLoading,
    isLoggedIn: !!data && !error,
    mutate,
  };
}