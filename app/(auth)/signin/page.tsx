'use client';

import { useState, FormEvent } from 'react';
import { BarLoader } from 'react-spinners';
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
import Sidebar from '@/components/Sidebar';

export default function SigninPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidebar props just like in your layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const form = e.currentTarget;
    const { email, password } = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      // mark signed in
      setIsSignedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  // Once signed in, render Sidebar (with its props) + page container
  if (isSignedIn) {
    return (
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>
    );
  }

  // Otherwise, show the sign‑in form
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
            Sign In
          </Button>
          {isPending && (
            <div className="mt-4 flex justify-center">
              <BarLoader height={6} width="100%" color="#36d7b7" />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
