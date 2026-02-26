'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { CompanyProvider } from '@/contexts/company-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid session
    const authenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('vx-token');

    if (authenticated && token) {
      setIsAuthenticated(true);
    } else {
      // Clear any stale partial state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('vx-token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      setIsAuthenticated(false);
      router.replace('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-background rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router redirecting to login
  }

  return (
    <CompanyProvider>
      <AppShell>
        {children}
      </AppShell>
    </CompanyProvider>
  );
}
