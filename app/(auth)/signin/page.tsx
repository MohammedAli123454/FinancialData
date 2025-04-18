'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { signinAction } from '@/app/actions/signIn'
import { signinAction } from '@/app/actions/signin'
export default function SigninPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSignin(formData: FormData) {
    startTransition(async () => {
      setError(null);
      try {
        await signinAction(formData);
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form action={handleSignin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" disabled={isPending}>{isPending ? 'Signing in...' : 'Sign In'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
