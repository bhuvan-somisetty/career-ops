'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationShell from '@/components/NavigationShell';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side local storage authorization check
    const loggedIn = localStorage.getItem('career_ops_logged_in');
    if (loggedIn !== 'true') {
      router.replace('/portal');
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] text-zinc-500 font-mono text-[10px] flex items-center justify-center">
        Verifying authorization credentials...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <NavigationShell>{children}</NavigationShell>;
}
