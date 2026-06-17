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
    // Server-session authorization check (HttpOnly cookie via /api/auth/me).
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          localStorage.removeItem('career_ops_logged_in');
          router.replace('/login');
          return;
        }
        return res.json().then((data) => {
          if (data?.studentId) localStorage.setItem('career_ops_student_id', data.studentId);
          localStorage.setItem('career_ops_logged_in', 'true');
          if (data?.onboardingCompleted === false) {
            router.replace('/student/onboarding');
            return;
          }
          setAuthorized(true);
        });
      })
      .catch(() => {
        if (!cancelled) router.replace('/login');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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
