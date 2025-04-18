// app/signup/SignupForm.tsx
'use client';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { signupAction } from '@/app/actions/signup';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(formData: FormData) {
    startTransition(async () => {
      setError(null);
      try {
        await signupAction(formData);
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
    <CardHeader>
      <CardTitle>Create an Account</CardTitle>
    </CardHeader>
    <CardContent>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form action={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <Input id="username" name="username" type="text" required />
        </div>
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
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <Select name="role" required>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superuser">Super User</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
    </CardContent>
  </Card>
  );
}