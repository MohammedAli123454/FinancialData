// app/signup/page.tsx
import { getCurrentUser } from '@/app/utils/auth';
import SignupForm from '@/components/SignupForm';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default async function SignupPage() {
  const user = await getCurrentUser();

  // 1) Not logged in
  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-20 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Lock className="w-6 h-6 text-red-500" />
            <span className="gradient-title">Access Denied</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4"> {/* Added pt-4 for top padding */}
          <p className="text-sm text-gray-600">
            You must be logged in to create an account or perform any transaction.
          </p>
          <Link href="/signin">
            <Button className="w-full mt-6"> {/* Added mt-6 for top margin */}
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 2) Logged in but not an admin
  if (user.role !== 'admin') {
    return (
      <Card className="max-w-md mx-auto mt-20 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Lock className="w-6 h-6 text-yellow-500" />
            <span className="gradient-title">Admin Access Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4"> {/* Added pt-4 for top padding */}
          <p className="text-sm text-gray-600">
            You must be logged in as an administrator to access this page.
          </p>
          <Link href="/signin">
            <Button className="w-full mt-6"> {/* Added mt-6 for top margin */}
              Go to Admin Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 3) Logged in as admin → show the signup form
  return <SignupForm />;
}