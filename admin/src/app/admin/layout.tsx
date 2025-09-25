import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';

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
