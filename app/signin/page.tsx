'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInData, signIn } from '@/app/actions/signIn';
import React from 'react';

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (data: SignInData) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn(data);
      if (result && 'error' in result) {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md p-6 space-y-4 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        {serverError && (
          <div className="p-2 text-center text-red-600 border border-red-600 rounded">
            {serverError}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block font-semibold">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block font-semibold">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Your password"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
