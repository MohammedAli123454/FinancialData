import { getCurrentUser } from '@/app/utils/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Login Successful ✅</h1>
      {user && (
        <p className="mt-2 text-gray-600">Welcome, {user.username}!</p>
      )}
    </div>
  );
}