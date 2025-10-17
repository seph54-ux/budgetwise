'use client';

import { Dashboard } from '@/components/dashboard';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
       <div className="flex flex-col flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-36" />
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="h-80 col-span-12 lg:col-span-4" />
            <Skeleton className="h-80 col-span-12 lg:col-span-3" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return <>{children}</>;
}


export default function Home() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
