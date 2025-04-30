'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';

export default function SigninPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const { email, password } = Object.fromEntries(new FormData(form));

    let data: any;
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
    } catch (err: any) {
      return setError(err.message);
    }

    // only the navigation is a transition
    startTransition(() => {
       router.push('/dashboard');


    });
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
