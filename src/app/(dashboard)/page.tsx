'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard root — redirects to CFO (the default module).
 * A real dashboard with KPIs, alerts, and sparklines will be added later
 * once live data feeds are wired up.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cfo');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
