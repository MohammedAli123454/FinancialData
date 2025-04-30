'use client';

import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex justify-end p-4">
        <Button onClick={() => router.push('/signin')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      Welcome to the Home Page (secured content)
    </div>
  );
}
