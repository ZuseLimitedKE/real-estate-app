import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';

/**
 * Server-side layout that authenticates the user and renders the admin UI shell around the page content.
 *
 * If no authenticated session is found, the user is redirected to `/login`.
 *
 * @param children - The page content to render inside the admin shell.
 * @returns The AdminShell React element with the authenticated session and the provided children.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Render a client-side shell that manages UI state (sidebar open/close)
  return <AdminShell session={session}>{children}</AdminShell>;
}
