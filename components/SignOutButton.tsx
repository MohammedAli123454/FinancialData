'use client';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const { mutate } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // 1) clear the cookie via your API
      const res = await fetch('/api/signout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Sign-out failed');
      }

      // 2) update client-side state
      await mutate();

      // 3) re-run server components (clears layouts, etc.)
      router.refresh();

      // 4) full page reload to ensure browser state is reset
      window.location.reload();

      // Optionally redirect to a sign-in page instead of reload
      // router.push('/signin');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
