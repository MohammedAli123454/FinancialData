'use client';

import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signoutAction } from '@/app/actions/signout';
import { useTransition } from 'react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return (
      <div className="flex justify-end p-4">
        <Button onClick={() => router.push('/signin')}>Sign In</Button>
      </div>
    );
  }
//   return (
//     <div className="flex min-h-screen">
//       <div className="flex-1">
//         <div className="flex justify-end p-4">
//           <Button
//             variant="outline"
//             disabled={isPending}
//             onClick={() => startTransition(() => signoutAction())}
//           >
//             {isPending ? 'Signing out...' : 'Sign Out'}
//           </Button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
 }