'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and redirect accordingly
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (isAuthenticated) {
      router.push('/cfo');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-background rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
