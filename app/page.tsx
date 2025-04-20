import { AuthWrapper } from '@/components/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <div className="p-6">Welcome to the Home Page (secured content)</div>
    </AuthWrapper>
  );
}
