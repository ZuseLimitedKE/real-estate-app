'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client component that immediately navigates to the admin dashboard and displays a centered loading UI while redirecting.
 *
 * @returns A JSX element containing a full-screen, centered spinner and the text "Redirecting to dashboard..." shown during navigation.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}