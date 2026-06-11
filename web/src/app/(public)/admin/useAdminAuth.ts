'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Client-side admin route guard. Redirects to /admin/login when not logged in. */
export function useAdminAuth() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ok = localStorage.getItem('career_ops_admin_logged_in') === 'true';
    if (!ok) router.replace('/admin/login');
    else setAuthorized(true);
    setLoading(false);
  }, [router]);

  return { authorized, loading };
}
