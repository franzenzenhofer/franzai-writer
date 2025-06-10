"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/app-providers';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function AuthGuard({ children, fallbackPath = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      router.push(fallbackPath);
    }
  }, [user, loading, router, fallbackPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return null;
  }

  return <>{children}</>;
}